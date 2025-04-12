import Link from 'next/link'

export default function SpotifyAuthError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Spotify Authentication Failed</h1>
      <p className="mb-6">
        Sorry, we couldn't connect to your Spotify account. This might be due to:
      </p>
      <ul className="list-disc text-left mb-8">
        <li className="mb-2">Denying the permission request</li>
        <li className="mb-2">A timeout in the authentication process</li>
        <li className="mb-2">A technical issue with Spotify's authentication service</li>
      </ul>
      <p className="mb-8">
        Please check the server logs for more details about the error.
      </p>
      <div className="flex space-x-4">
        <Link 
          href="/api/spotify/auth"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </Link>
        <Link 
          href="/"
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  )
} 