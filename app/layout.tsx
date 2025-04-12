import './globals.css'
import { Archivo_Black } from 'next/font/google'
import Script from 'next/script'

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'Rebecca & Seth | RSVP',
  description: 'RSVP form for Rebecca and Seth\'s wedding',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'Rebecca & Seth | RSVP',
    description: 'RSVP form for Rebecca and Seth\'s wedding - June 8, 2025',
    images: [
      {
        url: '/images/couple/bar-photo.jpg',
        width: 1200,
        height: 1200,
        alt: 'Rebecca and Seth Wedding RSVP',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rebecca & Seth | RSVP',
    description: 'RSVP form for Rebecca and Seth\'s wedding - June 8, 2025',
    images: ['/images/couple/bar-photo.jpg'],
  },
  metadataBase: new URL('https://rsvp.thegruhins.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.png" />
        {/* Google Analytics */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-F49NS3SCY6" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-F49NS3SCY6');
          `}
        </Script>
      </head>
      <body className={archivoBlack.className}>{children}</body>
    </html>
  )
}
