import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Sportisiaro - Terenuri Sportive',
  description: 'Găsește și listează terenuri sportive în orașul tău',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}

