"use client"

import { useState, useEffect, useCallback } from "react"
import { FluvioClient } from "@/lib/fluvio-client"

export function useFluvio(gameId: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    const fluvio = FluvioClient.getInstance()
    let unsubscribe: (() => void) | null = null

    const connectToStream = async () => {
      try {

        unsubscribe = await fluvio.subscribe(`game-${gameId}`, (message) => {
          setMessages((prev) => [...prev, message])
        })

        setIsConnected(true)
      } catch (error) {
        console.error("Error connecting to Fluvio stream:", error)
        setIsConnected(false)
      }
    }

    connectToStream()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [gameId])

  const sendMessage = useCallback(
    async (message: any) => {
      try {
        const fluvio = FluvioClient.getInstance()
        await fluvio.publish(`game-${gameId}`, {
          ...message,
          timestamp: new Date().toISOString(),
        })
        return true
      } catch (error) {
        console.error("Error sending message to Fluvio stream:", error)
        return false
      }
    },
    [gameId],
  )

  return {
    isConnected,
    messages,
    sendMessage,
  }
}
