import './globals.css' // MUST be top import
import ClientLayout from '@/components/ClientLayout' // We move logic here

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
    <html lang="en" className="h-full">
      {/* We remove 'use client' from here. 
         We delegate interaction to <ClientLayout> 
      */}
      <body className="h-full bg-slate-950 antialiased m-0 p-0">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}