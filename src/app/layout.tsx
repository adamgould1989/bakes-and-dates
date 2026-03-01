import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: "Bakes & Dates | LaLa's Calendar",
  description: "Order management calendar for LaLa's Bakes & Cakes",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1E3A16',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#FFFFFF',
            },
          }}
        />
      </body>
    </html>
  )
}
