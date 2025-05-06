import type { Metadata } from 'next'
import './globals.css'
import ConnectWallet from '@/components/connectWallet'
import Link from 'next/link'
import { WalletMultiButton } from '@/components/wallet-multi-button'

export const metadata: Metadata = {
  title: 'Crypto Tivia',
  description: 'Created by Walia',
  
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ConnectWallet >
          <header className="border-b">
            <div className="container flex items-center justify-between h-16 px-4 md:px-6">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                <span className="text-primary">CryptoTrivia</span>

              </Link>
              <WalletMultiButton />
            </div>
          </header>

        {children}
        </ConnectWallet>
        </body>
    </html>
  )
}
