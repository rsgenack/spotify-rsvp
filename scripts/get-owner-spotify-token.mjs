#!/usr/bin/env node

/**
 * One-time Spotify authentication script
 * 
 * This script helps the playlist owner (you) authenticate with Spotify
 * to get tokens that can be used by the RSVP app. Run this script once
 * and follow the instructions to save your tokens to the .env file.
 * 
 * Usage: 
 * 1. Run this script: node get-owner-spotify-token.mjs
 * 2. Open the URL in your browser and log in with YOUR Spotify account
 * 3. Authorize the permissions
 * 4. Copy the URL you're redirected to and paste it back here
 * 5. The script will extract your tokens and tell you where to add them
 */

import readline from 'readline';
import { randomBytes } from 'crypto';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Get credentials from environment variables
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;
const REDIRECT_URI = 'http://localhost:3001/callback';

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

console.log(`\n=== Spotify Owner Authentication Process ===\n`);
console.log('This script will help you (the playlist owner) authenticate with Spotify.');
console.log('You only need to run this ONCE to set up your credentials.');
console.log('\nIMPORTANT: You must login with YOUR OWN Spotify account - the one that owns the playlist!');
console.log(`\n1. Open this URL in your browser:`);
console.log(`\n${authUrl.toString()}\n`);
console.log(`2. Log in with YOUR Spotify account (the playlist owner)`);
console.log(`3. You'll be redirected to a URL that starts with: ${REDIRECT_URI}`);
console.log(`4. The page may show an error - that's OK! Copy the entire URL and paste it below\n`);

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
    
    console.log(`\n=== Authentication Successful! ===\n`);
    console.log(`Access Token received (valid for ${tokenData.expires_in} seconds)`);
    console.log(`Refresh Token received (long-lived token for refreshing access)`);
    
    // Verify the tokens by checking if we can access the playlist
    if (PLAYLIST_ID) {
      console.log(`\nVerifying access to playlist ID: ${PLAYLIST_ID}...`);
      
      const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${PLAYLIST_ID}`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });
      
      if (playlistResponse.ok) {
        const playlist = await playlistResponse.json();
        console.log(`✅ Successfully accessed playlist: "${playlist.name}"`);
      } else {
        console.log(`❌ Could not access playlist. Error: ${playlistResponse.status}`);
        console.log('Make sure the playlist ID is correct and your account has access to it.');
      }
    }
    
    // Create a .env.local file with the new tokens
    const envPath = path.resolve(process.cwd(), '.env.local');
    
    // Start with existing vars from .env
    let envContent = '';
    try {
      const dotenvPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(dotenvPath)) {
        envContent = fs.readFileSync(dotenvPath, 'utf8');
      }
    } catch (err) {
      console.log('Could not read existing .env file, creating new one');
    }
    
    // Add or update the token values
    const envLines = envContent.split('\n');
    const updatedLines = [];
    let accessTokenAdded = false;
    let refreshTokenAdded = false;
    
    for (const line of envLines) {
      if (line.startsWith('SPOTIFY_ACCESS_TOKEN=')) {
        updatedLines.push(`SPOTIFY_ACCESS_TOKEN=${tokenData.access_token}`);
        accessTokenAdded = true;
      } else if (line.startsWith('SPOTIFY_REFRESH_TOKEN=')) {
        updatedLines.push(`SPOTIFY_REFRESH_TOKEN=${tokenData.refresh_token}`);
        refreshTokenAdded = true;
      } else if (line.trim()) {
        updatedLines.push(line);
      }
    }
    
    if (!accessTokenAdded) {
      updatedLines.push(`SPOTIFY_ACCESS_TOKEN=${tokenData.access_token}`);
    }
    
    if (!refreshTokenAdded) {
      updatedLines.push(`SPOTIFY_REFRESH_TOKEN=${tokenData.refresh_token}`);
    }
    
    fs.writeFileSync(envPath, updatedLines.join('\n'));
    
    console.log(`\n✅ Success! Tokens saved to ${envPath}`);
    console.log('\nYour .env.local file now contains:');
    console.log('- SPOTIFY_ACCESS_TOKEN - For immediate playlist access');
    console.log('- SPOTIFY_REFRESH_TOKEN - For refreshing the access token when it expires');
    
    console.log('\n🎉 Setup complete! Your RSVP app can now add songs to your playlist.');
    console.log('Restart your Next.js server to apply these changes.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nPlease try running the script again.');
  } finally {
    rl.close();
  }
}); 