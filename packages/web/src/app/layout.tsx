import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider, CoupleProvider } from '@couple-calendar/shared'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Couple Calendar',
  description: 'Shared calendar and todo list for couples',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CoupleProvider>
            {children}
          </CoupleProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
