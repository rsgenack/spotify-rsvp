#!/usr/bin/env node

/**
 * Spotify Token Refresh Script
 * 
 * This script refreshes the Spotify access token using the refresh token from your .env file
 * and updates the .env file with the new access token.
 * 
 * Usage: 
 *   node scripts/refresh-spotify-token.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');

// Load environment variables from .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

// Extract Spotify credentials
const {
  SPOTIFY_CLIENT_ID: clientId,
  SPOTIFY_CLIENT_SECRET: clientSecret,
  SPOTIFY_REFRESH_TOKEN: refreshToken
} = envVars;

// Check if we have all required credentials
if (!clientId || !clientSecret || !refreshToken) {
  console.error('Error: Missing required Spotify credentials in .env file');
  console.error('Please make sure you have the following in your .env file:');
  console.error('  SPOTIFY_CLIENT_ID');
  console.error('  SPOTIFY_CLIENT_SECRET');
  console.error('  SPOTIFY_REFRESH_TOKEN');
  process.exit(1);
}

async function refreshAccessToken() {
  try {
    console.log('Refreshing Spotify access token...');
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Token refreshed successfully!');
    return data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    process.exit(1);
  }
}

async function updateEnvFile(tokenData) {
  try {
    console.log('Updating .env file with new access token...');
    
    // Create a backup of the original .env file
    const backupPath = `${envPath}.backup-${Date.now()}`;
    fs.copyFileSync(envPath, backupPath);
    console.log(`Backup created at ${backupPath}`);
    
    // Update the access token in the env content
    const updatedEnvContent = envContent.replace(
      /^SPOTIFY_ACCESS_TOKEN=.*/m,
      `SPOTIFY_ACCESS_TOKEN=${tokenData.access_token}`
    );
    
    // Update the refresh token if a new one was provided
    let finalEnvContent = updatedEnvContent;
    if (tokenData.refresh_token) {
      finalEnvContent = finalEnvContent.replace(
        /^SPOTIFY_REFRESH_TOKEN=.*/m,
        `SPOTIFY_REFRESH_TOKEN=${tokenData.refresh_token}`
      );
      console.log('New refresh token received and updated');
    }
    
    // Write the updated content to the .env file
    fs.writeFileSync(envPath, finalEnvContent);
    console.log('.env file updated successfully');
    
    return true;
  } catch (error) {
    console.error('Error updating .env file:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('==== Spotify Token Refresh Tool ====');
  
  try {
    // Refresh the token
    const tokenData = await refreshAccessToken();
    
    // Update the .env file
    await updateEnvFile(tokenData);
    
    console.log('\nSummary:');
    console.log(`New Access Token: ${tokenData.access_token.substring(0, 10)}...`);
    console.log(`Expires In: ${tokenData.expires_in} seconds (${Math.floor(tokenData.expires_in / 60)} minutes)`);
    console.log(`Token Type: ${tokenData.token_type}`);
    
    if (tokenData.refresh_token) {
      console.log(`New Refresh Token: ${tokenData.refresh_token.substring(0, 10)}...`);
    }
    
    console.log('\nRemember to update your Vercel environment variables with the new token!');
    console.log('https://vercel.com/dashboard/projects/your-project/settings/environment-variables');
    console.log('\nFor Vercel, add this environment variable:');
    console.log(`SPOTIFY_ACCESS_TOKEN=${tokenData.access_token}`);
    
    if (tokenData.refresh_token) {
      console.log(`SPOTIFY_REFRESH_TOKEN=${tokenData.refresh_token}`);
    }
    
    console.log('\n==== Process Complete ====');
  } catch (error) {
    console.error('Failed to refresh token:', error);
    process.exit(1);
  }
}

// Run the script
main(); 