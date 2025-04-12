#!/usr/bin/env node

/**
 * This script helps you get a Spotify access token with the necessary permissions
 * to modify a playlist. Follow the instructions below to generate your token.
 * 
 * Usage: 
 * 1. Run this script: node get-spotify-token.mjs
 * 2. Open the URL it gives you in a browser
 * 3. Authorize the app
 * 4. Copy the code from the redirect URL
 * 5. Paste it back into the terminal when prompted
 */

import readline from 'readline';
import { randomBytes } from 'crypto';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Get credentials from environment variables
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8888/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing Spotify credentials in .env file');
  process.exit(1);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Generate a random state for security
const state = randomBytes(16).toString('hex');

// Permissions we need
const scopes = [
  'playlist-modify-public',
  'playlist-modify-private',
  'playlist-read-private'
];

// Build authorization URL
const authUrl = new URL('https://accounts.spotify.com/authorize');
authUrl.searchParams.append('client_id', CLIENT_ID);
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
authUrl.searchParams.append('scope', scopes.join(' '));
authUrl.searchParams.append('state', state);

console.log(`\n=== Spotify Authorization Process ===\n`);
console.log(`1. Open this URL in your browser:`);
console.log(`\n${authUrl.toString()}\n`);
console.log(`2. Log in and authorize the application`);
console.log(`3. You'll be redirected to a URL that looks like: ${REDIRECT_URI}?code=SOMETHING&state=${state}`);
console.log(`4. Copy the entire URL and paste it below\n`);

rl.question('Paste the full callback URL here: ', async (callbackUrl) => {
  try {
    // Parse the URL to get the authorization code
    const url = new URL(callbackUrl);
    const code = url.searchParams.get('code');
    const returnedState = url.searchParams.get('state');
    
    if (!code) {
      throw new Error('Authorization code not found in URL');
    }
    
    if (returnedState !== state) {
      throw new Error('State mismatch. Security error.');
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token error: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    
    console.log(`\n=== Success! ===\n`);
    console.log(`Access Token: ${tokenData.access_token}`);
    console.log(`Refresh Token: ${tokenData.refresh_token}`);
    console.log(`Token Type: ${tokenData.token_type}`);
    console.log(`Expires In: ${tokenData.expires_in} seconds\n`);
    
    console.log(`Add these to your .env file:`);
    console.log(`\nSPOTIFY_ACCESS_TOKEN=${tokenData.access_token}`);
    console.log(`SPOTIFY_REFRESH_TOKEN=${tokenData.refresh_token}\n`);
    
    // Check if the token works by getting the current user profile
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });
    
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      console.log(`Authenticated as: ${profile.display_name} (${profile.id})`);
      
      // Check if we can access the playlist
      const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
      const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });
      
      if (playlistResponse.ok) {
        const playlist = await playlistResponse.json();
        console.log(`Successfully accessed playlist: ${playlist.name}`);
      } else {
        console.log(`Could not access playlist. Error: ${playlistResponse.status}`);
      }
    } else {
      console.log(`Could not verify token. Error: ${profileResponse.status}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
  }
}); 