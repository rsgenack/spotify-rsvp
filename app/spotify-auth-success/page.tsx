import Link from 'next/link'

export default function SpotifyAuthSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Spotify Authentication Successful!</h1>
      <p className="mb-6">
        Your Spotify account has been successfully connected. You can now use the app to add songs to your playlist.
      </p>
      <p className="mb-8">
        The access token has been saved in your browser cookies and will be used automatically when needed.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Return to Homepage
      </Link>
    </div>
  )
} 