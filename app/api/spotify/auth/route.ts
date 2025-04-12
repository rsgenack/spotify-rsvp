import { NextRequest, NextResponse } from 'next/server';

// This endpoint initiates the Spotify OAuth flow
export async function GET(request: NextRequest) {
  try {
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    
    if (!CLIENT_ID) {
      throw new Error('Missing Spotify client ID in environment variables');
    }
    
    // The redirect URL should be updated to point to your deployed application
    // For local testing, we'll use localhost
    const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3001/api/spotify/callback';
    
    // Generate a random state value to prevent CSRF attacks
    const state = Math.random().toString(36).substring(2, 15);
    
    // Permissions we need
    const scopes = [
      'playlist-modify-public',
      'playlist-modify-private',
      'playlist-read-private'
    ];
    
    // Build the Spotify authorization URL
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('scope', scopes.join(' '));
    authUrl.searchParams.append('state', state);
    
    // Store the state in a cookie for verification
    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set('spotify_auth_state', state, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // 5 minutes
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error initiating Spotify auth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Spotify authentication' },
      { status: 500 }
    );
  }
} 