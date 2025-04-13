#!/bin/bash

# Create necessary directories if they don't exist
mkdir -p app/api/spotify/add-to-playlist
mkdir -p app/api/spotify/auth
mkdir -p app/api/spotify/callback
mkdir -p app/api/spotify/search
mkdir -p app/api/spotify/token
mkdir -p app/api/submit-rsvp
mkdir -p app/admin
mkdir -p app/spotify-auth-error
mkdir -p app/spotify-auth-success
mkdir -p components/ui
mkdir -p hooks
mkdir -p lib
mkdir -p public/images/icons
mkdir -p styles

# Copy enhanced app directory from main
cp -r main/app/api/spotify app/api/
cp -r main/app/api/submit-rsvp app/api/
cp -r main/app/admin app/
cp -r main/app/spotify-auth-error app/
cp -r main/app/spotify-auth-success app/

# Copy necessary root files
cp main/app/layout.tsx app/
cp main/app/globals.css app/
cp main/app/page.tsx app/

# Copy components
cp -r main/components/ui/* components/ui/

# Copy other necessary directories
cp -r main/hooks/* hooks/
cp -r main/lib/* lib/
cp -r main/public/* public/
cp -r main/styles/* styles/

# Copy configuration files
cp main/tailwind.config.ts ./
cp main/postcss.config.mjs ./
cp main/components.json ./
cp main/package.json ./
cp main/.env ./

# Update README.md with new features
cat << 'EOF' > README.md
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
EOF

echo "Merge complete! Please review the changes and then commit them." 