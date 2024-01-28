import './globals.css'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import Providers from './providers'
import Navbar from './navbar'
import Footer from './footer'
import AlertBox from './alert-box'

export const metadata = {
  title: 'Drafter'
}

const inter = Inter({ subsets: ['latin'] })

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body className={inter.className}>
      <Providers>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-grow">
            <main className="flex w-full flex-col items-center p-12 max-w-screen-2xl mx-auto">
              {children}
            </main>
          </div>
          <AlertBox />
          <Footer />
        </div>
      </Providers>
      <Analytics />
      <SpeedInsights />
    </body>
  </html>
)

export default RootLayout
