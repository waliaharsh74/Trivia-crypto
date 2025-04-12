"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function WalletMultiButton() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Simulating wallet connection
  const connectWallet = async () => {
    setIsLoading(true)

    try {
      // In a real implementation, this would connect to MetaMask or other wallet providers
      // For demonstration purposes, we're simulating a connection
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockAddress = "0x" + Math.random().toString(16).slice(2, 12)
      setWalletAddress(mockAddress)
      setWalletConnected(true)

      // Store wallet info in localStorage for persistence
      localStorage.setItem("walletConnected", "true")
      localStorage.setItem("walletAddress", mockAddress)
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setWalletConnected(false)
    setWalletAddress("")
    localStorage.removeItem("walletConnected")
    localStorage.removeItem("walletAddress")
  }

  useEffect(() => {
    // Check if wallet was previously connected
    const connected = localStorage.getItem("walletConnected") === "true"
    const address = localStorage.getItem("walletAddress")

    if (connected && address) {
      setWalletConnected(true)
      setWalletAddress(address)
    }
  }, [])

  if (walletConnected) {
    return (
      <Button variant="outline" onClick={disconnectWallet} className="font-mono">
        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
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
