import Link from 'next/link'

export default function SpotifySetupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Spotify Setup for RSVP App</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl w-full">
        <h2 className="text-xl font-semibold mb-3">One-time Authorization</h2>
        <p className="mb-4">
          As the playlist owner, you need to authorize this app to modify your Spotify playlist.
          This is a one-time step that will save your authentication credentials.
        </p>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">
            <strong>Note:</strong> You'll need to login using your own Spotify account credentials 
            (the same account that owns the playlist you want to modify).
          </p>
        </div>
        
        <h2 className="text-xl font-semibold mb-3">Authentication Steps</h2>
        <ol className="list-decimal text-left pl-5 mb-6 space-y-2">
          <li>
            Run the authentication script by executing this command in your terminal:
            <pre className="bg-gray-100 p-2 mt-1 rounded text-sm overflow-x-auto">
              cd /Users/genack/Library/Mobile\ Documents/com~apple~CloudDocs/Code/airtable2rsvp && node scripts/get-owner-spotify-token.mjs
            </pre>
          </li>
          <li>
            The script will provide a URL for you to open in your browser.
          </li>
          <li>
            Log in with your personal Spotify account credentials.
          </li>
          <li>
            After authorizing, you'll be redirected to a URL - copy this full URL.
          </li>
          <li>
            Paste the URL back into the terminal and press Enter.
          </li>
          <li>
            The script will extract your tokens and save them to a .env.local file.
          </li>
          <li>
            Restart your Next.js server to apply the changes.
          </li>
        </ol>
        
        <h2 className="text-xl font-semibold mb-3">Troubleshooting</h2>
        <ul className="list-disc text-left pl-5 mb-6 space-y-2">
          <li>
            If you're having issues with the redirect URL, make sure your Spotify App in the developer dashboard
            has <code className="bg-gray-100 px-1">http://localhost:3001/callback</code> as an allowed redirect URI.
          </li>
          <li>
            If your tokens expire, run the script again to get new tokens.
          </li>
          <li>
            After setup, songs requested by users will be automatically added to your playlist.
          </li>
        </ul>
        
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">What happens after setup?</h3>
          <p>
            Once set up, the app will automatically add songs requested by wedding guests to your playlist
            without requiring them to authenticate with Spotify. It all happens behind the scenes using
            your stored credentials.
          </p>
        </div>
      </div>
    </div>
  )
} 