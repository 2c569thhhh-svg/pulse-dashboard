import type { Metadata } from 'next'
import { Syne } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Pulse — Music Publishing Intelligence',
  description: 'AI-powered music publishing lead discovery and outreach platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={syne.className}>{children}</body>
    </html>
  )
}
