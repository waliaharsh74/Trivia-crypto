import type { NextRequest } from "next/server"

// In a real implementation, this would connect to a database
const activeGames = new Map()

export async function POST(request: NextRequest) {
  try {
    const { gameId, playerAddress } = await request.json()

    // Validate inputs
    if (!gameId || !playerAddress) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the game
    const game = activeGames.get(gameId)
    if (!game) {
      return Response.json({ error: "Game not found" }, { status: 404 })
    }

    // Check if the game is already full
    if (game.player2) {
      return Response.json({ error: "Game is already full" }, { status: 400 })
    }

    // Check if the player is trying to join their own game
    if (game.player1.address === playerAddress) {
      return Response.json({ error: "Cannot join your own game" }, { status: 400 })
    }

    // Add the player to the game
    game.player2 = {
      address: playerAddress,
      score: 0,
    }

    // Update the game status
    game.status = "starting"

    // In a real implementation, this would also:
    // 1. Call the smart contract to escrow the bet from player 2
    // 2. Notify player 1 via the Fluvio stream that player 2 has joined

    return Response.json({ game })
  } catch (error) {
    console.error("Error joining game:", error)
    return Response.json({ error: "Failed to join game" }, { status: 500 })
  }
}
