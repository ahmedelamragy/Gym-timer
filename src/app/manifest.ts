import type { MetadataRoute } from 'next'

/** Lets phones install the app ("Add to Home Screen") and open it full screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gym Timer',
    short_name: 'Gym Timer',
    description: 'Interval timer with rounds and saved workouts',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      { src: '/icons/192', sizes: '192x192', type: 'image/png' },
      { src: '/icons/512', sizes: '512x512', type: 'image/png' },
      { src: '/icons/512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  }
}
