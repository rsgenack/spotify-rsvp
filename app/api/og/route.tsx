import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            position: 'relative',
            backgroundColor: '#000000',
          }}
        >
          {/* Background Image */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* This is a placeholder. The actual background would need to be accessible via a public URL */}
            <div style={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: '#37352f',
              opacity: 0.8, 
            }} />
          </div>
          
          {/* Text Container */}
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#D2F348',
              padding: '40px 50px',
              borderRadius: 24,
              maxWidth: '80%',
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            <h1 
              style={{
                fontSize: 48,
                color: '#37352f',
                marginBottom: 10,
              }}
            >
              REBECCA & SETH | RSVP
            </h1>
            <p
              style={{
                fontSize: 24,
                color: '#37352f',
              }}
            >
              Please RSVP to the wedding of Rebecca Genack & Seth Gruhin
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    console.error(e);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
} 