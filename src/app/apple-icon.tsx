import { renderAppIcon } from '@/lib/app-icon'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** iPhone/iPad "Add to Home Screen" icon. */
export default function AppleIcon() {
  return renderAppIcon(180)
}
