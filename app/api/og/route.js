import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract property data from URL params
    const title = searchParams.get('title') || 'Luxury Property';
    const price = searchParams.get('price') || '';
    const currency = searchParams.get('currency') || 'RWF';
    const location = searchParams.get('location') || 'Kigali, Rwanda';
    const image = searchParams.get('image');

    const formattedPrice = price ? `${currency} ${Number(price).toLocaleString()}` : 'Price on Request';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            backgroundColor: '#0B132B',
            backgroundImage: image ? `url(${image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '60px',
          }}
        >
          {/* Dark Gradient Overlay for readability */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(11, 19, 43, 0.95) 0%, rgba(11, 19, 43, 0.4) 50%, rgba(11, 19, 43, 0.1) 100%)',
            }}
          />

          {/* Logo Tag */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '10px 20px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <img
              src="https://www.bydproperties.rw/logo-transparent.png"
              alt="Logo"
              style={{ height: '40px' }}
            />
          </div>

          {/* Price Badge */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#DF9F3D',
              color: '#0B132B',
              padding: '10px 24px',
              borderRadius: '50px',
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '24px',
              boxShadow: '0 8px 20px rgba(223, 159, 61, 0.3)',
              position: 'relative',
            }}
          >
            {formattedPrice}
          </div>

          {/* Title and Location */}
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: 'white',
                lineHeight: 1.1,
                marginBottom: '16px',
                maxWidth: '900px',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '24px',
                color: 'rgba(255, 255, 255, 0.8)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DF9F3D"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: '12px' }}
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {location}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
