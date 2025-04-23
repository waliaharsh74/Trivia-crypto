"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, Trophy, AlertCircle } from "lucide-react"
import { useAccount } from "wagmi"
import { WalletMultiButton } from "@/components/wallet-multi-button"
import Link from "next/link"
import { handleStartGame } from "@/app/server"

interface Question {
  id: number
  text: string
  options: string[]
  correctAnswer: number
}

interface GameState {
  status: "waiting" | "starting" | "in-progress" | "completed"
  currentQuestionIndex: number
  timeRemaining: number
  player1Score: number
  player2Score: number
  player1Address: string
  player2Address?: string
  questions: Question[]
  playerAnswers: (number | null)[]
  winner?: "player1" | "player2" | "tie"
}

export default function GamePage() {
  const router = useRouter()
  const params = useParams()
 const { isConnected } = useAccount()
  
  const gameId = params.id as string

  const [gameState, setGameState] = useState<GameState>({
    status: "waiting",
    currentQuestionIndex: 0,
    timeRemaining: 10,
    player1Score: 0,
    player2Score: 0,
    player1Address: "0x1234...5678", 
    questions: [],
    playerAnswers: [],
  })

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    const loadGameData = async () => {
      try {
 
        await new Promise((resolve) => setTimeout(resolve, 1500))

       
        const mockQuestions: Question[] = Array.from({ length: 15 }, (_, i) => ({
          id: i + 1,
          text: `Sample question ${i + 1} about various trivia topics?`,
          options: [
            `Option A for question ${i + 1}`,
            `Option B for question ${i + 1}`,
            `Option C for question ${i + 1}`,
            `Option D for question ${i + 1}`,
          ],
          correctAnswer: Math.floor(Math.random() * 4),
        }))

        setGameState((prev) => ({
          ...prev,
          status: "waiting",
          questions: mockQuestions,
          playerAnswers: Array(mockQuestions.length).fill(null),
        }))

        setIsLoading(false)

      
        // setTimeout(() => {
        //   setGameState((prev) => ({
        //     ...prev,
        //     status: "starting",
        //     player2Address: "0x9876...4321",
        //   }))

        //   setTimeout(() => {
        //     setGameState((prev) => ({
        //       ...prev,
        //       status: "in-progress",
        //       timeRemaining: 10,
        //     }))

           
        //     startTimer()
        //   }, 3000)
        // }, 3000)
      } catch (error) {
        console.error("Error loading game data:", error)
      }
    }

    loadGameData()
  }, [gameId])


  const startTimer = () => {
    const timerInterval = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timerInterval)

          if (prev.currentQuestionIndex < prev.questions.length - 1) {

            const updatedAnswers = [...prev.playerAnswers]
            if (selectedAnswer !== null) {
              updatedAnswers[prev.currentQuestionIndex] = selectedAnswer
            }

   
            let newScore = prev.player1Score
            if (selectedAnswer === prev.questions[prev.currentQuestionIndex].correctAnswer) {
              newScore += 1
            }

   
            setSelectedAnswer(null)

            setTimeout(() => startTimer(), 500)

            return {
              ...prev,
              currentQuestionIndex: prev.currentQuestionIndex + 1,
              timeRemaining: 10,
              player1Score: newScore,
              playerAnswers: updatedAnswers,
            }
          } else {
       

            const updatedAnswers = [...prev.playerAnswers]
            if (selectedAnswer !== null) {
              updatedAnswers[prev.currentQuestionIndex] = selectedAnswer
            }

     
            let finalScore = prev.player1Score
            if (selectedAnswer === prev.questions[prev.currentQuestionIndex].correctAnswer) {
              finalScore += 1
            }

            const player2FinalScore = Math.floor(Math.random() * 15)


            let winner: "player1" | "player2" | "tie" = "tie"
            if (finalScore > player2FinalScore) {
              winner = "player1"
            } else if (player2FinalScore > finalScore) {
              winner = "player2"
            }

            return {
              ...prev,
              status: "completed",
              player1Score: finalScore,
              player2Score: player2FinalScore,
              playerAnswers: updatedAnswers,
              winner,
            }
          }
        }

        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }
      })
    }, 1000)

    return () => clearInterval(timerInterval)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    setIsSubmitting(true)

   
    // setTimeout(() => {
    //   setGameState((prev) => {
    //     const updatedAnswers = [...prev.playerAnswers]
    //     updatedAnswers[prev.currentQuestionIndex] = selectedAnswer

    //     let newScore = prev.player1Score
    //     if (selectedAnswer === prev.questions[prev.currentQuestionIndex].correctAnswer) {
    //       newScore += 1
    //     }


    //     if (prev.currentQuestionIndex < prev.questions.length - 1) {
    //       setSelectedAnswer(null)
    //       setIsSubmitting(false)

    //       return {
    //         ...prev,
    //         currentQuestionIndex: prev.currentQuestionIndex + 1,
    //         timeRemaining: 10,
    //         player1Score: newScore,
    //         playerAnswers: updatedAnswers,
    //       }
    //     } else {
         
    //       const player2FinalScore = Math.floor(Math.random() * 15)


    //       let winner: "player1" | "player2" | "tie" = "tie"
    //       if (newScore > player2FinalScore) {
    //         winner = "player1"
    //       } else if (player2FinalScore > newScore) {
    //         winner = "player2"
    //       }

    //       return {
    //         ...prev,
    //         status: "completed",
    //         player1Score: newScore,
    //         player2Score: player2FinalScore,
    //         playerAnswers: updatedAnswers,
    //         winner,
    //       }
    //     }
    //   })
    // }, 500)
  }


  if (isLoading) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen px-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading game...</p>
      </div>
    )
  }
  if (!isConnected) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>You need to connect your cryptocurrency wallet to play CryptoTrivia.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletMultiButton />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/" className="text-sm text-gray-500 hover:underline">
              Back to Home
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (gameState.status === "waiting") {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Waiting for Opponent</h2>
            <p className="mb-6">Share this game ID with your friend:</p>
            <div className="p-3 bg-gray-100 rounded-md font-mono text-center mb-6 dark:bg-gray-800">{gameId}</div>
            {/* <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /> */}
            <Button className="w-full" onClick={handleStartGame}>
              Start Game
            </Button>
            <p className="mt-4 text-sm text-gray-500">
              Your bet has been placed in escrow. It will be returned if no one joins.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState.status === "starting") {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Game Starting</h2>
            <p className="mb-6">Opponent has joined! Get ready...</p>
            <div className="flex justify-between items-center mb-6">
              <div className="text-left">
                <p className="font-semibold">You</p>
                <p className="text-sm text-gray-500">{gameState.player1Address}</p>
              </div>
              <div className="text-2xl font-bold">VS</div>
              <div className="text-right">
                <p className="font-semibold">Opponent</p>
                <p className="text-sm text-gray-500">{gameState.player2Address}</p>
              </div>
            </div>
            <p className="text-lg font-bold">Game starts in 3 seconds...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState.status === "completed") {
    // Calculate winnings
    const betAmount = 0.05 // This would be the actual bet amount
    const currency = "ETH" // This would be the actual currency

    let winningsText = ""
    if (gameState.winner === "player1") {
      // Winner gets total bet minus 6% fee
      const winnings = betAmount * 2 * 0.94
      winningsText = `You won ${winnings.toFixed(4)} ${currency}!`
    } else if (gameState.winner === "player2") {
      winningsText = "You lost your bet."
    } else {
      // Tie - get original bet back
      winningsText = `Tie game! Your ${betAmount} ${currency} has been returned.`
    }

    return (
      <div className="container flex flex-col items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Game Complete</h2>

            {gameState.winner === "player1" ? (
              <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            ) : gameState.winner === "tie" ? (
              <AlertCircle className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            ) : (
              <AlertCircle className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            )}

            <div className="flex justify-between items-center mb-6">
              <div className="text-center">
                <p className="font-semibold">You</p>
                <p className="text-2xl font-bold">{gameState.player1Score}</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">Opponent</p>
                <p className="text-2xl font-bold">{gameState.player2Score}</p>
              </div>
            </div>

            <p className="text-lg font-bold mb-4">{winningsText}</p>

            <div className="mt-6 space-y-4">
              <Button className="w-full" onClick={() => router.push("/play")}>
                Play Again
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // In-progress game
  const currentQuestion = gameState.questions[gameState.currentQuestionIndex]

  return (
    <div className="container px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm">
              Question {gameState.currentQuestionIndex + 1} of {gameState.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">Time:</p>
            <p className="font-mono">{gameState.timeRemaining}s</p>
          </div>
        </div>

        <Progress value={(gameState.timeRemaining / 10) * 100} className="mb-6" />

        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-6">{currentQuestion.text}</h2>

            <RadioGroup value={selectedAnswer?.toString()} className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-colors ${
                    selectedAnswer === index ? "bg-primary/10 border-primary" : ""
                  }`}
                  onClick={() => setSelectedAnswer(index)}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Button className="w-full" disabled={selectedAnswer === null || isSubmitting} onClick={handleSubmitAnswer}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Answer"
          )}
        </Button>

        <div className="mt-6 flex justify-between">
          <div>
            <p className="text-sm font-semibold">Your Score</p>
            <p className="text-lg">{gameState.player1Score} correct</p>
          </div>
          {gameState.player2Address && (
            <div className="text-right">
              <p className="text-sm font-semibold">Opponent</p>
              <p className="text-lg">? correct</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
