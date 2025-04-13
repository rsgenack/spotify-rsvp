# Enhanced RSVP Form with Airtable Integration and Spotify Song Requests

An enhanced implementation of an RSVP form that connects to Airtable and includes Spotify song request integration and dietary restriction options.

## Enhanced Features

* **Spotify Integration**:
  * Song search functionality with preview playback
  * Direct addition of requested songs to a Spotify playlist
  * OAuth authentication flow for Spotify
  
* **Dietary Restrictions**:
  * Visual icon selection for dietary preferences
  * Support for multiple restrictions per guest
  * Options include: Gluten-free, Vegetarian, Pescatarian, Soy, Sesame, Egg, and Nut allergies

* **Core Features**:
  * Phone number lookup to find guest records in Airtable
  * RSVP form for multiple guests in a family/group
  * Song request and additional notes fields
  * Submission to Airtable API
  * Thank you confirmation page

## Configuration

Make sure your `.env.local` file contains the following variables:

```
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=your_spotify_redirect_uri
SPOTIFY_PLAYLIST_ID=your_spotify_playlist_id
```

## Airtable Structure

The application expects an Airtable base with a table named "Address Collector" that has the following fields:

* `Phone Number` - Primary phone number for lookup
* `Partner Phone Number` - Optional secondary phone number
* `First Name` - Primary guest's first name
* `Last Name` - Primary guest's last name
* `Partner First Name` - Partner's first name (if applicable)
* `Partner Last Name` - Partner's last name (if applicable)
* `Child 1` through `Child 6` - Names of children (if applicable)
* `RSVP_Primary` - Boolean for primary guest's attendance
* `RSVP_Partner` - Boolean for partner's attendance
* `RSVP_Child_1` through `RSVP_Child_6` - Booleans for children's attendance
* `RSVP_Notes` - Text field for additional notes
* `RSVP_Song_Request` - Text field for song requests
* `RSVP_Date` - Date field for when the RSVP was submitted
* `Person1-GlutenFree`, `Person2-GlutenFree` - Boolean fields for dietary restrictions
* `Person1-Vegetarian`, `Person2-Vegetarian` - Boolean fields for dietary restrictions
* `Person1-Pescatarian`, `Person2-Pescatarian` - Boolean fields for dietary restrictions
* `Person1-SoyAllergy`, `Person2-SoyAllergy` - Boolean fields for allergies
* `Person1-SesameAllergy`, `Person2-SesameAllergy` - Boolean fields for allergies
* `Person1-EggAllergy`, `Person2-EggAllergy` - Boolean fields for allergies
* `Person1-NutAllergy`, `Person2-NutAllergy` - Boolean fields for allergies

## Development

Run the development server:

```
npm run dev
```

The application will be available at http://localhost:3000.
