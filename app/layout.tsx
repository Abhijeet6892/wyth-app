import './globals.css'
import { Playfair_Display, Inter } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'WYTH',
  description: 'A social space for serious intentions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* Deep Blue Background applied globally */}
      <body className={`${inter.className} bg-slate-950 text-white antialiased m-0 p-0`}>
        {children}
      </body>
    </html>
  )
}