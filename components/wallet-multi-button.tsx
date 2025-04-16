"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useConnect, useDisconnect, useAccount } from "wagmi"

export function WalletMultiButton() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<`0x${string}` | undefined |string>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
      const {connectors,connect}=useConnect()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
      useEffect(() => {
          setMounted(true)
      }, [])
  
     


  const connectWallet = async () => {
    setIsLoading(true)

    try {
      const connector=connectors[0];
      connect({connector})



      setWalletAddress(address)
      setWalletConnected(true)
      localStorage.setItem("walletConnected", "true")
      if(address)
      localStorage.setItem("walletAddress", address)

    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    disconnect()
    setWalletConnected(false)
    setWalletAddress(undefined)

  }

  useEffect(() => {

    const connected = localStorage.getItem("walletConnected") === "true"
    const address = localStorage.getItem("walletAddress")

    if (connected && address) {
      setWalletConnected(true)
      setWalletAddress(address)
    }
  }, [])
  if (!mounted) return null

  if (walletConnected) {
    return (
      <Button variant="outline" onClick={disconnectWallet} className="font-mono">
        {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
      </Button>
    )
  }


  return (
    <Button onClick={connectWallet} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        "Connect Wallet"
      )}
    </Button>
  )
}
