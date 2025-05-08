import type { Metadata } from 'next'
import './globals.css'
import ConnectWallet from '@/components/connectWallet'
import Link from 'next/link'
import { WalletMultiButton } from '@/components/wallet-multi-button'
import { NavBar } from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'Crypto Tivia',
  description: 'Created by Walia',
  icons:{
    icon:'logo.png'
  }
  
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
         <NavBar/>

        {children}
        </ConnectWallet>
        </body>
    </html>
  )
}
