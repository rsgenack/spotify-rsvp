# Wedding RSVP with Spotify Integration

A wedding RSVP application with Spotify song request integration that allows guests to search for and request songs that will be added to your wedding playlist.

## Features

- RSVP form for wedding guests
- Phone number-based guest lookup
- Spotify song search integration
- Automatic addition of requested songs to a Spotify playlist
- Airtable integration for storing guest information and responses

## Setup

### Prerequisites

- Node.js 16+ and npm/pnpm
- Spotify Developer account with app credentials
- Airtable account with a base for guest information

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rsgenack/spotify-rsvp.git
cd spotify-rsvp
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env` file with the following:
```
# Airtable credentials
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id

# Spotify credentials
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_PLAYLIST_ID=your_spotify_playlist_id
SPOTIFY_REDIRECT_URI=http://localhost:3001/callback
```

4. Authenticate with Spotify (for playlist owner):
```bash
node scripts/get-owner-spotify-token.mjs
```
Follow the prompts to authenticate with your Spotify account.

5. Start the development server:
```bash
npm run dev
# or
npx next dev
```

## How It Works

1. Wedding guests access the RSVP form and enter their phone number
2. The app searches for matching guests in Airtable
3. Guests can select who's attending and search for song requests
4. When a song is selected and the form submitted:
   - RSVP responses are saved to Airtable
   - The requested song is added to your Spotify playlist using your credentials

## Environment Variables

- `AIRTABLE_API_KEY`: Your Airtable API key
- `AIRTABLE_BASE_ID`: Your Airtable base ID
- `SPOTIFY_CLIENT_ID`: Your Spotify app client ID
- `SPOTIFY_CLIENT_SECRET`: Your Spotify app client secret
- `SPOTIFY_PLAYLIST_ID`: ID of the Spotify playlist to add songs to
- `SPOTIFY_REDIRECT_URI`: Redirect URI for Spotify authentication
- `SPOTIFY_ACCESS_TOKEN`: Spotify access token (added by auth script)
- `SPOTIFY_REFRESH_TOKEN`: Spotify refresh token (added by auth script)

## License

MIT License - See LICENSE file for details. 