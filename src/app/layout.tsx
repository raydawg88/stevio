import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'STEVIO | The Daily Word Search',
  description: 'A vintage newspaper-styled word search puzzle',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
