"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useConnect, useAccount, useDisconnect } from "wagmi"

export function WalletMultiButton() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const { connect, connectors, variables, isPending } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()


  if (connectors.length === 0) return null
  if (!mounted) return null
  
  if (isConnected && address) {
    return (
      <Button variant="outline" onClick={() => disconnect()} className="font-mono">
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    )
  }

  const primaryConnector = connectors[0]
  const isConnecting = isPending && variables?.connector === primaryConnector

  return (
    <Button
      onClick={() => connect({ connector: primaryConnector })}
      disabled={isConnecting}
      className="font-mono"
    >
      {isConnecting ? (
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
