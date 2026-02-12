import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav"; 

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WYTH - Connect for Life",
  description: "High-intent social network for relationships.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ADDED: suppressHydrationWarning prop here
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} font-sans antialiased bg-brand-bg text-slate-900`}>
        <main className="min-h-screen flex flex-col relative pb-32">
          {children}
        </main>
        
        {/* RENDER THE NAV */}
        <BottomNav />
      </body>
    </html>
  );
}