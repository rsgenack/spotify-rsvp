import { NextRequest, NextResponse } from 'next/server';

// Interface definitions for typed requests
interface GuestResponse {
  guestId: string;
  name: string;
  type: string;
  attending: boolean;
}

interface RsvpResponseItem {
  recordId: string;
  guestResponses: GuestResponse[];
  notes?: string;
  songRequest?: string;
  kidsInvited: boolean;
}

interface SubmitRsvpRequest {
  phoneNumber: string;
  responses: RsvpResponseItem[];
  notes: string;
  songRequest: string;
}

/**
 * API handler to submit RSVP responses to Airtable
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: SubmitRsvpRequest = await request.json();
    
    // Get credentials from environment variables
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error('Missing Airtable configuration');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Validate required fields
    if (!body.phoneNumber || !body.responses || !Array.isArray(body.responses)) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    const phoneNumber = body.phoneNumber.replace(/\D/g, '');
    console.log(`Processing RSVP submission for phone: ${phoneNumber.slice(0, 3)}***${phoneNumber.slice(-4)}`);
    console.log(`Updating ${body.responses.length} family records`);

    // Group responses by record ID
    const recordUpdates = body.responses.reduce((acc: Record<string, any>, response) => {
      if (!acc[response.recordId]) {
        acc[response.recordId] = {
          id: response.recordId,
          fields: {
            // Use the exact field names from Airtable CSV file
            'Song_Request': body.songRequest || '',
            'Additional_Notes': body.notes || '',
          },
        };
      }

      // Convert boolean to string 'Yes'/'No' for Airtable
      response.guestResponses.forEach((guest) => {
        if (guest.type === 'primary') {
          acc[response.recordId].fields['Person1-RSVP'] = guest.attending ? 'Yes' : 'No';
        } else if (guest.type === 'partner') {
          acc[response.recordId].fields['Person2-RSVP'] = guest.attending ? 'Yes' : 'No';
        } else if (guest.type.startsWith('child')) {
          // Only include children responses if Kids-Invited is true
          const kidsInvited = response.kidsInvited ?? false;
          if (kidsInvited) {
            acc[response.recordId].fields['Children-RSVP'] = guest.attending ? 'Yes' : 'No';
          }
        }
      });

      return acc;
    }, {});

    // Log the update we're about to make
    console.log(`Preparing to update ${Object.keys(recordUpdates).length} Airtable records`);

    // Make request to Airtable API to update records
    const airtableResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Address%20Collector`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: Object.values(recordUpdates) }),
    });

    if (!airtableResponse.ok) {
      const errorText = await airtableResponse.text();
      console.error(`Airtable API error: ${airtableResponse.status} ${airtableResponse.statusText} - ${errorText}`);
      throw new Error(`Airtable API error: ${airtableResponse.statusText} - ${errorText}`);
    }

    const responseData = await airtableResponse.json();
    console.log(`Successfully updated ${responseData.records?.length || 0} records in Airtable`);

    return NextResponse.json({ 
      success: true,
      message: 'RSVP submitted successfully',
      updatedRecords: responseData.records?.length || 0
    }, { status: 200 });
  } catch (error) {
    console.error('Error in submit-rsvp API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 