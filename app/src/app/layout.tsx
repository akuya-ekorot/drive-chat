import { type Metadata } from 'next'
import { ClerkProvider, } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeSwitcher } from '@/components/custom/theme-switcher'
import { ThemeProvider } from '@/components/custom/theme-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Drive Chat',
  description: 'Chat with your Google Drive files',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <div className='absolute bottom-4 right-4'>
              <ThemeSwitcher />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
