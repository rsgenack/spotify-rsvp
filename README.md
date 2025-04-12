# Minimal RSVP Form with Airtable Integration

A completely stripped-down implementation of an RSVP form that connects to Airtable. The project has been reduced to only the essential files needed for functionality, making it extremely easy to apply your own custom styling.

## Core Features

- Phone number lookup to find guest records in Airtable
- RSVP form for multiple guests in a family/group
- Song request and additional notes fields
- Submission to Airtable API
- Thank you confirmation page

## Project Structure

This project has been stripped to its bare essentials:

- `/app/api/search-guests` - API endpoint to search for guests by phone number
- `/app/api/submit-rsvp` - API endpoint to submit RSVP responses to Airtable
- `/components/ui/rsvp-form.tsx` - Core RSVP form component with no styling
- `/app/framer/page.tsx` - Main page that displays the RSVP form
- `/app/globals.css` - Minimal CSS with only Tailwind imports
- `/app/layout.tsx` - Simple layout component

All unnecessary files and components have been removed.

## HTML Structure for Styling

The form has no styling and uses simple HTML elements with semantic IDs:

### Main Container IDs

- `#rsvp-container` - The main container for the entire RSVP form
- `#phone-entry` - The phone number entry screen
- `#guest-response` - The guest response screen
- `#thank-you` - The thank you confirmation screen
- `#error` - Error message container

## Configuration

Make sure your `.env.local` file contains the following variables:

```
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
```

## Airtable Structure

The application expects an Airtable base with a table named "Address Collector" that has the following fields:

- `Phone Number` - Primary phone number for lookup
- `Partner Phone Number` - Optional secondary phone number
- `First Name` - Primary guest's first name
- `Last Name` - Primary guest's last name
- `Partner First Name` - Partner's first name (if applicable)
- `Partner Last Name` - Partner's last name (if applicable)
- `Child 1` through `Child 6` - Names of children (if applicable)
- `RSVP_Primary` - Boolean for primary guest's attendance
- `RSVP_Partner` - Boolean for partner's attendance
- `RSVP_Child_1` through `RSVP_Child_6` - Booleans for children's attendance
- `RSVP_Notes` - Text field for additional notes
- `RSVP_Song_Request` - Text field for song requests
- `RSVP_Date` - Date field for when the RSVP was submitted

## Development

Run the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000). 