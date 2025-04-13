# Spotify RSVP

An RSVP management system with Spotify integration that allows event guests to request songs when they RSVP to an event.

## Features

- Phone number-based guest lookup
- RSVP submission for multiple family members
- Spotify integration for song requests
- Adds requested songs to a Spotify playlist
- Admin interface for managing RSVPs

## Prerequisites

- Node.js 18+ and npm
- Spotify Developer account and application credentials
- Airtable account and API key

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_ACCESS_TOKEN=your_spotify_access_token
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token
SPOTIFY_PLAYLIST_ID=your_playlist_id
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The application will be available at http://localhost:3004

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

- `app/` - Next.js 15 app directory
- `app/api/` - API routes
- `components/` - React components
- `lib/` - Utility functions and shared code
- `public/` - Static assets

## License

MIT
