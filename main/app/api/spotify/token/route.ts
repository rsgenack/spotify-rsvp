import { NextRequest, NextResponse } from 'next/server';

// Cache the token to avoid excessive requests
let cachedToken: {
  access_token: string;
  expires_at: number;
} | null = null;

export async function GET() {
  try {
    // Check if we have a valid cached token
    if (cachedToken && cachedToken.expires_at > Date.now()) {
      return NextResponse.json({ access_token: cachedToken.access_token });
    }

    // If no valid token, request a new one
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Missing Spotify credentials in environment variables');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Spotify token error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache the token with expiration
    cachedToken = {
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in * 1000) - 60000, // Subtract 1 minute for safety
    };

    return NextResponse.json({ access_token: data.access_token });
  } catch (error) {
    console.error('Error fetching Spotify token:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Spotify token' },
      { status: 500 }
    );
  }
} 