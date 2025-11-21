import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sportisiaro',
  description: 'Găsește terenuri sportive în România',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  )
}
