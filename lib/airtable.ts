// Remove the import from env.ts and access process.env directly
// import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from "@/lib/env"

interface Guest {
  id: string
  name: string
  type: "primary" | "partner" | "child"
  recordId: string
  attending?: boolean | null
}

interface RsvpResponse {
  recordId: string
  guestResponses: {
    guestId: string
    name: string
    type: string
    attending: boolean
  }[]
  notes: string
}

// Function to search for guests by phone number
export async function searchGuests(phoneNumber: string): Promise<Guest[]> {
  try {
    // Access environment variables directly
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

    // Ensure we have the required environment variables
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error("Missing Airtable environment variables")
      return []
    }

    // Format the phone number for consistent searching
    // Remove all non-digit characters
    const normalizedPhone = phoneNumber.replace(/\D/g, "")

    // Create a filter formula to search both primary and partner phone numbers
    // This removes all non-digit characters from the stored phone numbers for comparison
    const filterFormula = `
      OR(
        SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE({Phone Number}, "+", ""), " ", ""), "-", ""), "(", ""), ")", "") = "${normalizedPhone}",
        SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE({Partner Phone Number}, "+", ""), " ", ""), "-", ""), "(", ""), ")", "") = "${normalizedPhone}"
      )
    `

    // Make request to Airtable API
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Address%20Collector?filterByFormula=${encodeURIComponent(filterFormula)}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
        cache: "no-store", // Don't cache the results
      },
    )

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.statusText}`)
    }

    const data = await response.json()

    // If no records found, return empty array
    if (!data.records || data.records.length === 0) {
      return []
    }

    // Process each record to extract all family members
    const allGuests: Guest[] = []

    data.records.forEach((record: any) => {
      const fields = record.fields

      // Add primary person
      if (fields["First Name"]) {
        allGuests.push({
          id: `${record.id}-primary`,
          name: `${fields["First Name"]} ${fields["Last Name"] || ""}`.trim(),
          type: "primary",
          recordId: record.id,
          attending: fields["RSVP_Primary"] || null,
        })
      }

      // Add partner if exists
      if (fields["Partner First Name"]) {
        allGuests.push({
          id: `${record.id}-partner`,
          name: `${fields["Partner First Name"]} ${fields["Partner Last Name"] || ""}`.trim(),
          type: "partner",
          recordId: record.id,
          attending: fields["RSVP_Partner"] || null,
        })
      }

      // Add children if they exist
      for (let i = 1; i <= 6; i++) {
        if (fields[`Child ${i}`] && fields[`Child ${i}`].trim()) {
          allGuests.push({
            id: `${record.id}-child-${i}`,
            name: fields[`Child ${i}`].trim(),
            type: "child",
            recordId: record.id,
            attending: fields[`RSVP_Child_${i}`] || null,
          })
        }
      }
    })

    return allGuests
  } catch (error) {
    console.error("Error fetching guests:", error)
    return []
  }
}

// Function to submit RSVP responses
export async function submitRsvp(phoneNumber: string, responses: RsvpResponse[], notes: string): Promise<void> {
  try {
    // Access environment variables directly
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

    // Ensure we have the required environment variables
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      throw new Error("Missing Airtable environment variables")
    }

    // Group responses by record ID
    const recordUpdates = responses.reduce((acc: Record<string, any>, response) => {
      if (!acc[response.recordId]) {
        acc[response.recordId] = {
          id: response.recordId,
          fields: {
            RSVP_Notes: notes,
            RSVP_Date: new Date().toISOString(),
          },
        }
      }

      // Add responses for each guest type
      response.guestResponses.forEach((guest) => {
        if (guest.type === "primary") {
          acc[response.recordId].fields["RSVP_Primary"] = guest.attending
        } else if (guest.type === "partner") {
          acc[response.recordId].fields["RSVP_Partner"] = guest.attending
        } else if (guest.type.startsWith("child")) {
          const childNumber = guest.type.split("-")[1]
          acc[response.recordId].fields[`RSVP_Child_${childNumber}`] = guest.attending
        }
      })

      return acc
    }, {})

    // Make request to Airtable API to update records
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Address%20Collector`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: Object.values(recordUpdates) }),
    })

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.statusText}`)
    }
  } catch (error) {
    console.error("Error submitting RSVP:", error)
    throw error
  }
}
