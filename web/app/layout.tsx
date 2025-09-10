import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/query'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gentle - Your Empathetic Productivity Companion',
  description: 'Whatever you\'re feeling is okay. Take one tiny step at a time.',
  manifest: '/manifest.json',
  themeColor: '#f8fafc',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gentle',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* PWA meta tags */}
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* PostHog & Sentry initialization would go here */}
        {/* 
        <script dangerouslySetInnerHTML={{
          __html: `
            // PostHog init
            // if (process.env.NEXT_PUBLIC_POSTHOG_KEY) { ... }
            
            // Sentry init
            // if (process.env.NEXT_PUBLIC_SENTRY_DSN) { ... }
          `
        }} />
        */}
      </head>
      <body className={`${inter.className} h-full bg-gentle-50 dark:bg-gentle-900 text-gentle-900 dark:text-gentle-50`}>
        <QueryProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1 container max-w-md mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}