import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './contexts/AppContext';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('http://localhost:3001'),
  title: 'NSS IIIT Raichur - National Service Scheme',
  description: 'National Service Scheme at IIIT Raichur - Not me, but you. Join us in making a difference through community service and social impact.',
  keywords: 'NSS, IIIT Raichur, National Service Scheme, Community Service, Social Impact, Volunteering',
  authors: [{ name: 'NSS IIIT Raichur' }],
  openGraph: {
    title: 'NSS IIIT Raichur - National Service Scheme',
    description: 'Join NSS at IIIT Raichur for community service and social impact',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <AppProvider>
          <Toaster position="top-center" />
          {children}
        </AppProvider>
      </body>
    </html>
  )
}