import { NextRequest, NextResponse } from 'next/server';
import { withSpotifyToken } from '@/lib/spotify-token-manager';

// Add a track to a Spotify playlist using the token manager
export async function POST(request: NextRequest) {
  try {
    const { trackUri } = await request.json();
    
    if (!trackUri) {
      return NextResponse.json({ error: 'Track URI is required' }, { status: 400 });
    }

    // Get the playlist ID from environment variables
    const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
    
    if (!playlistId) {
      throw new Error('Missing Spotify playlist ID in environment variables');
    }
    
    // Use the token manager to handle authentication and refresh
    const result = await withSpotifyToken(async (token) => {
      const addTrackResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: [trackUri]
        })
      });
      
      if (!addTrackResponse.ok) {
        const errorData = await addTrackResponse.text();
        throw new Error(`Spotify API error: ${addTrackResponse.status} - ${errorData}`);
      }
      
      return addTrackResponse.json();
    });
    
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