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
  description: 'Please RSVP to the wedding of Rebecca Genack & Seth Gruhin',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'Rebecca & Seth | RSVP',
    description: 'Please RSVP to the wedding of Rebecca Genack & Seth Gruhin',
    images: [
      {
        url: 'https://framerusercontent.com/images/4tGdZuQWS2bC7FvmVcbdTFse0Ys.jpg?scale-down-to=1024',
        width: 1024,
        height: 1024,
        alt: 'Rebecca and Seth Wedding RSVP',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rebecca & Seth | RSVP',
    description: 'Please RSVP to the wedding of Rebecca Genack & Seth Gruhin',
    images: ['https://framerusercontent.com/images/4tGdZuQWS2bC7FvmVcbdTFse0Ys.jpg?scale-down-to=1024'],
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
