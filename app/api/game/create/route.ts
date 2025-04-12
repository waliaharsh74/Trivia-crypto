import type { NextRequest } from "next/server"
import { v4 as uuidv4 } from "uuid"

// In a real implementation, this would connect to a database
const activeGames = new Map()

export async function POST(request: NextRequest) {
  try {
    const { topic, betAmount, currency, playerAddress } = await request.json()

    // Validate inputs
    if (!topic || !betAmount || !currency || !playerAddress) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate a unique game ID
    const gameId = uuidv4()

    // Create a new game
    const game = {
      id: gameId,
      topic,
      betAmount,
      currency,
      createdAt: new Date().toISOString(),
      status: "waiting",
      player1: {
        address: playerAddress,
        score: 0,
      },
      player2: null,
      questions: [], // These would be fetched from the questions API
    }

    // Store the game
    activeGames.set(gameId, game)

    // In a real implementation, this would also:
    // 1. Call the smart contract to escrow the bet
    // 2. Set up a Fluvio stream for the game
    // 3. Generate questions using the Groq API

    return Response.json({ gameId, game })
  } catch (error) {
    console.error("Error creating game:", error)
    return Response.json({ error: "Failed to create game" }, { status: 500 })
  }
}
