import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'FPS Test — Can Your PC Run It? Check FPS & Game Requirements Free',
  description: 'Find out exactly how many FPS your PC will get on Low, Medium, and High settings. FPS Test analyzes your GPU, CPU, RAM, and storage to estimate gaming performance and check if your system meets game requirements — free, instant, no download needed.',
  keywords: ['fps test', 'can my pc run it', 'fps checker', 'pc gaming performance', 'game requirements checker', 'how many fps will i get', 'gpu fps estimator', 'check pc specs for gaming', 'system requirements test', 'fps calculator'],
  authors: [{ name: 'FPS Test' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://fpstest.online/',
  },
  openGraph: {
    type: 'website',
    url: 'https://fpstest.online/',
    siteName: 'FPS Test',
    title: 'FPS Test — How Many FPS Will Your PC Get?',
    description: 'Instantly check your PC\'s FPS on Low, Medium, and High settings. Analyzes your GPU, CPU, RAM, and storage. Free, fast, and accurate — no download required.',
    images: [
      {
        url: 'https://fpstest.online/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FPS Test — PC Gaming Performance Checker',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FPS Test — Check Your PC\'s Gaming FPS Free',
    description: 'How many FPS will your PC get? Enter your specs and instantly see performance on Low, Medium, and High settings. Free PC gaming performance checker.',
    images: ['https://fpstest.online/og-image.png'],
  },
  other: {
    'theme-color': '#0f0f0f',
    'application-name': 'FPS Test',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f0f0f',
  width: 'device-width',
  initialScale: 1,
}

import { Providers } from '@/lib/providers'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased text-foreground bg-background`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "FPS Test",
              "url": "https://fpstest.online/",
              "description": "Free tool that analyzes your PC hardware and estimates FPS on Low, Medium, and High graphics settings, while checking game system requirements.",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Windows",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "FPS estimation for Low, Medium, and High quality",
                "GPU, CPU, RAM, and storage analysis",
                "Game system requirements checker",
                "No download or install required"
              ],
              "audience": {
                "@type": "Audience",
                "audienceType": "Gamers, PC builders, PC enthusiasts"
              }
            })
          }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
