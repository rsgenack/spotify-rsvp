import { NextRequest, NextResponse } from 'next/server';

// Interface definitions
interface Guest {
  id: string;
  name: string;
  type: "primary" | "partner" | "child";
  recordId: string;
  attending?: boolean | null;
}

/**
 * API handler to search for guests by phone number
 */
export async function GET(request: NextRequest) {
  try {
    // Get the phone number from the query params
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Get credentials from environment variables
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error('Missing Airtable configuration');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Format the phone number for consistent searching
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    
    // Log search attempt for debugging (redact API key)
    console.log(`Searching for phone: ${normalizedPhone.slice(0, 3)}***${normalizedPhone.slice(-4)} in base: ${AIRTABLE_BASE_ID}`);

    // Create a filter formula to search both primary and partner phone numbers
    const filterFormula = `
      OR(
        SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE({Phone Number}, "+", ""), " ", ""), "-", ""), "(", ""), ")", "") = "${normalizedPhone}",
        SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE({Partner Phone Number}, "+", ""), " ", ""), "-", ""), "(", ""), ")", "") = "${normalizedPhone}"
      )
    `;

    // Make request to Airtable API
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Address%20Collector?filterByFormula=${encodeURIComponent(filterFormula)}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Airtable API error: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error(`Airtable API error: ${response.statusText}`);
    }

    const data = await response.json();

    // If no records found, return empty array
    if (!data.records || data.records.length === 0) {
      console.log('No guests found with that phone number');
      return NextResponse.json([], { status: 200 });
    }

    console.log(`Found ${data.records.length} matching records`);

    // Process each record to extract all family members
    const allGuests: Guest[] = [];

    data.records.forEach((record: any) => {
      const fields = record.fields;

      // Add primary person
      if (fields['First Name']) {
        allGuests.push({
          id: `${record.id}-primary`,
          name: `${fields['First Name']} ${fields['Last Name'] || ''}`.trim(),
          type: 'primary',
          recordId: record.id,
          attending: fields['RSVP_Primary'] || null,
        });
      }

      // Add partner if exists
      if (fields['Partner First Name']) {
        allGuests.push({
          id: `${record.id}-partner`,
          name: `${fields['Partner First Name']} ${fields['Partner Last Name'] || ''}`.trim(),
          type: 'partner',
          recordId: record.id,
          attending: fields['RSVP_Partner'] || null,
        });
      }

      // Add children if they exist
      for (let i = 1; i <= 6; i++) {
        if (fields[`Child ${i}`] && fields[`Child ${i}`].trim()) {
          allGuests.push({
            id: `${record.id}-child-${i}`,
            name: fields[`Child ${i}`].trim(),
            type: 'child',
            recordId: record.id,
            attending: fields[`RSVP_Child_${i}`] || null,
          });
        }
      }
    });

    console.log(`Returning ${allGuests.length} guests`);
    return NextResponse.json(allGuests, { status: 200 });
  } catch (error) {
    console.error('Error in search-guests API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 