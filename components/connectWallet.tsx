"use client"
import React, { ReactNode, useState } from 'react'
import { queryClient } from '@/Client'
import { QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/config'

const ConnectWallet = ({children}:Readonly<{children:ReactNode}>) => {

    
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>

    </WagmiProvider>
  )
}

export default ConnectWallet