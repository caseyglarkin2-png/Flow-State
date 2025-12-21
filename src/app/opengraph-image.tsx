import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'Flow State - The Logistics Singularity'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          {/* Logo Icon */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: 30 }}
          >
            <circle cx="12" cy="12" r="10" stroke="#22d3ee" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="4" fill="#22d3ee" />
          </svg>
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: 'white',
              letterSpacing: '-0.05em',
            }}
          >
            FLOW STATE
          </div>
        </div>
        <div
          style={{
            fontSize: 40,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          The Logistics Singularity
        </div>
        
        {/* Decorative elements - Red dots/vectors */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', opacity: 0.5 }}>
             <div style={{ width: 1200, height: 1, background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 60, display: 'flex', gap: 40 }}>
             <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
             <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
             <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
