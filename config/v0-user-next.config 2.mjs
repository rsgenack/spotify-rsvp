/**
 * User-specific Next.js configuration
 * This file extends the main Next.js config with custom settings
 */

/** @type {import('next').NextConfig} */
const userConfig = {
  // Optional: Override environment variables
  env: {
    // Add your custom environment variables here
  },
  
  // Optional: Add or modify redirects
  async redirects() {
    return [
      // Add your redirects here if needed
    ]
  },
  
  // Optional: Add custom webpack configuration
  webpack: (config, { isServer }) => {
    // Add your custom webpack configuration here if needed
    return config
  },
}

export default userConfig 