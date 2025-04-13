import { NextRequest, NextResponse } from 'next/server';

// Helper function to refresh the token
async function refreshAccessToken(refreshToken: string) {
  try {
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET || !refreshToken) {
      throw new Error('Missing Spotify credentials or refresh token');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

// Add a track to a Spotify playlist using environment variable credentials
export async function POST(request: NextRequest) {
  try {
    const { trackUri } = await request.json();
    
    if (!trackUri) {
      return NextResponse.json({ error: 'Track URI is required' }, { status: 400 });
    }

    // Get credentials from environment variables
    const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
    const accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    
    if (!playlistId) {
      throw new Error('Missing Spotify playlist ID in environment variables');
    }
    
    // If no tokens in environment, display information for manual setup
    if (!accessToken && !refreshToken) {
      console.log('========================================');
      console.log('NO SPOTIFY AUTH - ADMIN NEEDS TO SETUP AUTH');
      console.log('========================================');
      console.log(`Track URI: ${trackUri}`);
      console.log('To set up authentication, visit:');
      console.log('http://localhost:3001/admin/spotify-setup');
      console.log('========================================');
      
      return NextResponse.json({
        success: false,
        needs_setup: true,
        message: 'Spotify authentication not set up yet. Admin needs to complete setup.',
        setup_url: '/admin/spotify-setup'
      }, { status: 401 });
    }
    
    // Try to add the track with the existing token
    let token = accessToken;
    let addTrackResponse;
    
    if (token) {
      addTrackResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: [trackUri]
        })
      });
      
      // If token is expired and we have a refresh token, try refreshing
      if (addTrackResponse.status === 401 && refreshToken) {
        console.log('Access token expired, refreshing...');
        token = await refreshAccessToken(refreshToken);
        
        // Try again with the new token
        addTrackResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uris: [trackUri]
          })
        });
        
        if (addTrackResponse.ok) {
          console.log('Successfully refreshed token. Update the SPOTIFY_ACCESS_TOKEN in your .env.local file with:');
          console.log(`SPOTIFY_ACCESS_TOKEN=${token}`);
        }
      }
    } else if (refreshToken) {
      // If we only have a refresh token, try to get a new access token
      token = await refreshAccessToken(refreshToken);
      
      // Add the track with the new token
      addTrackResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: [trackUri]
        })
      });
      
      if (addTrackResponse.ok) {
        console.log('Successfully generated new token. Add this to your .env.local file:');
        console.log(`SPOTIFY_ACCESS_TOKEN=${token}`);
      }
    }
    
    // If we still can't add the track, provide info about setup
    if (!addTrackResponse || !addTrackResponse.ok) {
      const errorText = addTrackResponse ? await addTrackResponse.text() : 'No response';
      console.error('Failed to add track to playlist:', errorText);
      
      return NextResponse.json({
        success: false,
        needs_setup: true,
        message: 'Failed to add track to playlist. Authentication may have expired.',
        setup_url: '/admin/spotify-setup'
      }, { status: 401 });
    }
    
    // Success - track was added to the playlist
    const trackId = trackUri.split(':').pop();
    const spotifyTrackUrl = `https://open.spotify.com/track/${trackId}`;
    
    console.log('========================================');
    console.log('TRACK ADDED SUCCESSFULLY TO PLAYLIST');
    console.log('========================================');
    console.log(`Playlist: ${playlistId}`);
    console.log(`Track URI: ${trackUri}`);
    console.log(`Spotify URL: ${spotifyTrackUrl}`);
    console.log('========================================');
    
    return NextResponse.json({ 
      success: true,
      message: 'Track successfully added to playlist',
      trackUri,
      trackUrl: spotifyTrackUrl,
      playlistId
    });
    
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    return NextResponse.json({
      error: 'Failed to add track to playlist',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 