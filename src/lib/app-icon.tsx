import { ImageResponse } from 'next/og'

/** The app icon (a stopwatch) as a PNG, drawn at build time for home screens. */
export function renderAppIcon(size: number) {
  const glyph = Math.round(size * 0.68)
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
        }}
      >
        <svg width={glyph} height={glyph} viewBox="0 0 64 64">
          <rect x="26" y="3" width="12" height="7" rx="2" fill="#10b981" />
          <circle cx="32" cy="37" r="22" fill="none" stroke="#10b981" strokeWidth="6" />
          <line x1="32" y1="37" x2="32" y2="23" stroke="#fafafa" strokeWidth="5" strokeLinecap="round" />
          <line x1="32" y1="37" x2="41" y2="43" stroke="#fafafa" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  )
}
