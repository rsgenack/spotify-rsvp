import { NextRequest, NextResponse } from 'next/server';

// This endpoint handles the Spotify OAuth callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Check if there's an error
    if (error) {
      console.error('Spotify auth error:', error);
      return NextResponse.redirect('/spotify-auth-error');
    }
    
    // Make sure code and state are present
    if (!code || !state) {
      return NextResponse.redirect('/spotify-auth-error');
    }
    
    // Verify state to prevent CSRF attacks
    const storedState = request.cookies.get('spotify_auth_state')?.value;
    if (state !== storedState) {
      console.error('State mismatch. Potential CSRF attack.');
      return NextResponse.redirect('/spotify-auth-error');
    }
    
    // Exchange the authorization code for access and refresh tokens
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
    const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3001/api/spotify/callback';
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Missing Spotify credentials');
    }
    
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      })
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`Token error: ${tokenResponse.status} - ${errorText}`);
      return NextResponse.redirect('/spotify-auth-error');
    }
    
    const tokenData = await tokenResponse.json();
    
    // Store tokens in cookies
    const response = NextResponse.redirect('/spotify-auth-success');
    
    // Set the access token and refresh token as secure cookies
    response.cookies.set('spotify_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenData.expires_in,
      path: '/',
    });
    
    response.cookies.set('spotify_refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
    
    // Also display tokens in the console for manual saving if needed
    console.log('=== Spotify Authentication Successful ===');
    console.log(`Access Token: ${tokenData.access_token}`);
    console.log(`Refresh Token: ${tokenData.refresh_token}`);
    console.log(`Expires In: ${tokenData.expires_in} seconds`);
    console.log('=======================================');
    console.log('Add these to your .env file if you want to use them directly:');
    console.log(`SPOTIFY_ACCESS_TOKEN=${tokenData.access_token}`);
    console.log(`SPOTIFY_REFRESH_TOKEN=${tokenData.refresh_token}`);
    
    return response;
  } catch (error) {
    console.error('Error handling Spotify callback:', error);
    return NextResponse.redirect('/spotify-auth-error');
  }
} 