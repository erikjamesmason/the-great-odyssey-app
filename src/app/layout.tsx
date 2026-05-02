import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Great Odyssey',
  description: 'Design three radically different versions of your future life',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  )
}
