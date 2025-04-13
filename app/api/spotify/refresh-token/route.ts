import { NextRequest, NextResponse } from 'next/server';

/**
 * This endpoint refreshes the Spotify access token using the refresh token
 * It's designed to be called automatically when the token expires
 */
export async function GET(request: NextRequest) {
  try {
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    
    if (!refreshToken) {
      throw new Error('Missing refresh token in environment variables');
    }

    const newToken = await refreshAccessToken(refreshToken);
    
    // Log the new token for update in production environments
    console.log('=== Spotify Token Refreshed ===');
    console.log(`New Access Token: ${newToken.access_token}`);
    console.log(`Expires In: ${newToken.expires_in} seconds`);
    console.log('=== Update your .env file and Vercel environment variables with: ===');
    console.log(`SPOTIFY_ACCESS_TOKEN=${newToken.access_token}`);
    
    // Return the new token
    return NextResponse.json({
      success: true,
      access_token: newToken.access_token,
      expires_in: newToken.expires_in,
      expires_at: newToken.expires_at
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to refresh token',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to refresh the Spotify access token
 */
async function refreshAccessToken(refreshToken: string) {
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  try {
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Missing Spotify client credentials');
    }

    const request = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
      cache: 'no-cache', // Important to prevent caching issues
    });

    const response = await request.json();

    if (response.error) {
      throw new Error(`Error refreshing access token: ${response.error}`);
    }

    const refreshedToken = {
      access_token: response.access_token,
      token_type: response.token_type || 'Bearer',
      scope: response.scope || '',
      expires_in: response.expires_in || 3600,
      expires_at: Math.floor(Date.now() / 1000) + (response.expires_in || 3600), // Calculate new expiration
      refresh_token: response.refresh_token || refreshToken, // Use new refresh token if provided
    };

    return refreshedToken;
  } catch (error) {
    console.error('Error refreshing access token', error);
    throw error;
  }
} 