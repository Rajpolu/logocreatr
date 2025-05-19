import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'logocreatr App',
  description: 'Crafted with ❤️ in India',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
