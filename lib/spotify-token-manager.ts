/**
 * Spotify Token Manager
 * 
 * This module handles automatic Spotify token management including:
 * - Caching the current token in memory
 * - Checking token expiration
 * - Automatic refreshing when needed
 * - No manual intervention required
 */

// In-memory token cache
let cachedToken: {
  access_token: string;
  expires_at: number;
  refresh_token?: string;
} | null = null;

/**
 * Get a valid Spotify access token
 * - Checks if the cached token is valid
 * - Automatically refreshes if expired
 * - Returns a valid token
 */
export async function getSpotifyToken(): Promise<string> {
  // Check if we have a valid cached token
  const now = Math.floor(Date.now() / 1000);
  
  if (cachedToken && cachedToken.expires_at > now + 60) { // 60-second buffer
    return cachedToken.access_token;
  }
  
  // Token is expired or not cached, refresh it
  return await refreshSpotifyToken();
}

/**
 * Refresh the Spotify token and update the cache
 */
async function refreshSpotifyToken(): Promise<string> {
  try {
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    
    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error('Missing required Spotify credentials in environment variables');
    }
    
    // Make the refresh token request
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Update the token cache
    cachedToken = {
      access_token: data.access_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      refresh_token: data.refresh_token || refreshToken
    };
    
    // Log that the token was refreshed, but only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Spotify Token Manager] Token refreshed successfully');
    }
    
    return cachedToken.access_token;
  } catch (error) {
    console.error('[Spotify Token Manager] Error refreshing token:', error);
    throw error;
  }
}

/**
 * Use this function in any API route or server component that needs to make 
 * Spotify API requests. It will handle token refreshing automatically.
 * 
 * Example:
 * ```
 * import { withSpotifyToken } from '@/lib/spotify-token-manager';
 * 
 * const response = await withSpotifyToken(async (token) => {
 *   return fetch('https://api.spotify.com/v1/me/playlists', {
 *     headers: {
 *       'Authorization': `Bearer ${token}`
 *     }
 *   });
 * });
 * ```
 */
export async function withSpotifyToken<T>(
  callback: (token: string) => Promise<T>
): Promise<T> {
  try {
    // Get a valid token
    const token = await getSpotifyToken();
    
    // Execute the callback with the token
    return await callback(token);
  } catch (error) {
    console.error('[Spotify Token Manager] Error in withSpotifyToken:', error);
    throw error;
  }
} 