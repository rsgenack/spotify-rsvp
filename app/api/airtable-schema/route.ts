import { NextRequest, NextResponse } from 'next/server';

/**
 * API handler to get the schema of the Airtable base
 */
export async function GET(request: NextRequest) {
  try {
    // Get credentials from environment variables
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error('Missing Airtable configuration');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Get the table metadata to see all fields
    const response = await fetch(
      `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
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
    
    // Extract and return just the tables and their fields
    const tables = data.tables.map((table: any) => {
      return {
        id: table.id,
        name: table.name,
        fields: table.fields.map((field: any) => ({
          id: field.id,
          name: field.name,
          type: field.type,
          options: field.options
        }))
      };
    });

    return NextResponse.json({ tables }, { status: 200 });
  } catch (error) {
    console.error('Error in airtable-schema API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 