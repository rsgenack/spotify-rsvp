import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Get token from our token endpoint
    const tokenResponse = await fetch(new URL('/api/spotify/token', request.url).toString());
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to get Spotify token');
    }
    
    const { access_token } = await tokenResponse.json();

    // Search for tracks on Spotify
    const spotifyResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      }
    );

    if (!spotifyResponse.ok) {
      const errorData = await spotifyResponse.json();
      throw new Error(`Spotify API error: ${spotifyResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await spotifyResponse.json();
    
    // Format the response to include only the data we need
    const tracks = data.tracks.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((artist: any) => artist.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url,
      uri: track.uri,
      previewUrl: track.preview_url
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return NextResponse.json(
      { error: 'Failed to search songs on Spotify' },
      { status: 500 }
    );
  }
} 