"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, Trophy, ChevronLeft, ChevronRight } from "lucide-react"
import { useAccount, useBalance, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { WalletMultiButton } from "@/components/wallet-multi-button"

import { calculateScore, isBetValid, startCreatorGame, userValidity } from "@/app/server"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Input } from "@/components/ui/input"
import { wagmiAbi } from "@/utils/Abt"
import { parseEther } from "viem"
import FancyButton from "@/components/ui/FancyButton"
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS! as `0x${string}`



interface Question {
  question: string
  options: string[]
  correctIndex: number
}

interface GameState {
  status: "waiting" | "starting" | "in-progress" | "completed"
  currentQuestionIndex: number
  timeRemaining: number
  playerScore: number
  questions: Question[]
  playerAnswers: (number | null)[]
  totalTime: number
  submitted: boolean
}

export default function GamePage() {
  const router = useRouter()
  const params = useParams()
  const { isConnected, address } = useAccount()
  const gameId = params.id as string

  const [gameState, setGameState] = useState<GameState>({
    status: "waiting",
    currentQuestionIndex: 0,
    timeRemaining: 900,
    playerScore: 0,
    questions: [],
    playerAnswers: [],
    totalTime: 900,
    submitted: false
  })

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [content, setContent] = useState<any>(null)
  const [gameStaring, setGameStarting] = useState(false)
  const [addJoiner, setAddJoiner] = useState(false)
  const [amount, setAmount] = useState('')
  const [topic, setTopic] = useState('')
  const [joining, setJoining] = useState(false)
  const [betValid, setBetValid] = useState(true)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [oneTimeSubmitted,setOneTimeSubmitted]=useState(false)
  const { writeContractAsync } = useWriteContract()
  const result = useWaitForTransactionReceipt({
    hash: txHash!,
    query: {
      enabled: !!txHash,
    },
    confirmations: 1,
  })
  const balance = useBalance({
      address
    })


  useEffect(() => {
    // console.log('contractAddress', contractAddress);
    setIsLoading(true)
    async function checkBetVaidity() {
      if (!address) return
      const check = await isBetValid(gameId, address);
      
      setBetValid(check.isValid)
      if (!check.isValid) {
        toast({
          description: check.msg,
          title: "Message"
        })
        
        // router.push(`/play`)

      }
      if (check.amount && check.topic) {
        setAmount(check.amount)
        setTopic(check.topic)
        // setAddJoiner(true)  
      }
      console.log(check.bet);
      if(check?.bet && !check?.bet?.joinerId && check.bet.creatorId!=address){
        
        setAddJoiner(true)
      }
      setIsLoading(false)
    }
    checkBetVaidity()
    
  }, [address])

  useEffect(() => {
    const ValidateUser = async () => {
      if (result?.isFetched && result.status === 'success' && txHash) {
        const { msg, userValid } = await userValidity(gameId, address,txHash,amount)

        
        if (!userValid) {
          toast({ title: 'Error!', description: msg })
          return
        }
        setAddJoiner(false)
        setJoining(false)
        toast({ title: 'Joined!', description: msg })

      }
    }
    ValidateUser()

  }, [result.isFetched,result.status])

  useEffect(() => {

    const timer = setInterval(() => {
      if (gameState.status === "in-progress" && !gameState.submitted) {
        setGameState(prev => {
          if (prev.timeRemaining <= 0) {
            handleSubmitAnswers()
            return { ...prev, timeRemaining: 0 }
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 }
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.status, gameState.submitted])

  useEffect(() => {
    if (content) {

      try {

        const questions = content.questions
        console.log("question", questions);

        setGameState(prev => ({
          ...prev,
          questions,
          playerAnswers: new Array(questions.length).fill(null),
          status: "in-progress"
        }))
      } catch (error) {
        toast({ title: "Error", description: "Failed to parse questions" })
      }
    }
  }, [content])

  const handleStartGame = async () => {
    try {
      if (!address) return
      setGameStarting(true)
      const { msg, content: serverContent } = await startCreatorGame(gameId, address)

      if (!serverContent) {
        setGameStarting(false)
        toast({ title: "Error", description: msg })
        return
      }

      setContent(serverContent)
      setGameStarting(false)
    } catch (error) {
      console.error(error)
      setGameStarting(false)
      toast({ title: "Error", description: "Failed to start game" })
    }
  }

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index)
    setGameState(prev => {
      const newAnswers = [...prev.playerAnswers]
      newAnswers[prev.currentQuestionIndex] = index
      return { ...prev, playerAnswers: newAnswers }
    })
  }

  const handleQuestionNavigation = (direction: "prev" | "next") => {
    setGameState(prev => {
      const newIndex = direction === "prev"
        ? Math.max(0, prev.currentQuestionIndex - 1)
        : Math.min(prev.questions.length - 1, prev.currentQuestionIndex + 1)

      setSelectedAnswer(prev.playerAnswers[newIndex])
      return { ...prev, currentQuestionIndex: newIndex }
    })
  }

  const handleSubmitAnswers = async () => {
    try {
      
    
    if (gameState.submitted) return
    setOneTimeSubmitted(true)
    setGameState(prev => ({
      ...prev,
      submitted: true
    }))

    const {score} = await calculateScore(gameState.playerAnswers, gameId, address);
  
  



    setGameState(prev => ({
      ...prev,
      playerScore: score,
      status: "completed",
      submitted: true
    }))
    // router.push(`winner/${gameId}`)
    } catch (error:any) {
      console.log(error);
      toast({
        title:"Erro!",
        description:error?.message || "error in submitting answers"
      })
    }
  }


  const handleJoin = async () => {
    if (!address) return
    console.log(balance?.data?.formatted);
    if (!balance || balance.data && balance?.data?.formatted <= amount) {
      toast({
        title: "Insufficent Balance!",
        description: `Require more than ${amount} Eth`
      })
      return

    }
    setJoining(true)
   

    try {
      const tx = await writeContractAsync({
        address: contractAddress,
        abi: wagmiAbi,
        functionName: "joinBet",
        args: [gameId],
        value: parseEther(amount),
      });

      toast({
        title: "Transaction Sent!",
        description: (
          <a target="_blank" href={`https://sepolia.etherscan.io/tx/${tx}`}>
            View on Etherscan
          </a>
        )
      });

      setTxHash(tx)
      




    } catch (e: any) {
      console.log(e);
      toast({ title: 'Join Failed', description: e?.message })
      setJoining(false)

    } 
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
            <CardDescription>Connect your wallet to play</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletMultiButton />
          </CardContent>
        </Card>
      </div>
    )
  }
  if (addJoiner) {
    return (
      <div className="container mx-auto p-4 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join Quiz Bet</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Game ID</Label>
            <Input readOnly value={gameId} className="font-mono mb-4" />


            {(
              <>
                <p className="mb-2">
                  <span className="font-semibold">Topic:</span> {topic}
                </p>
                <p className="mb-4">
                  <span className="font-semibold">Bet Amount:</span> {amount} ETH
                </p>
                {isConnected && (
                  <FancyButton onClick={handleJoin} className="w-full" disabled={joining  }>{joining  ? (
                      <>
                        {/* <Loader2 className="mr-2 h-4 w-4 animate-spin" /> */}
                        Joining...
                      </>
                    ) : (
                      "Join Bet"
                    )}</FancyButton>
                
                )}
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="link" className="text-[#f7f7d9]" onClick={() => router.push('/play')}>Back</Button>
          </CardFooter>
        </Card>
        <Toaster />
      </div>
    )
  }

  if (gameState.status === "waiting") {
    return (



      <div className="container flex flex-col items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Ready to play?</CardTitle>
          </CardHeader>
          <CardContent >
            <Label>Game ID</Label>
            <Input readOnly value={gameId} className="font-mono mb-4" />

         
            <p className="mb-2">
              <span className="font-semibold">Topic:</span> {topic}
            </p>
            <p className="mb-4">
              <span className="font-semibold">Bet Amount:</span> {amount} ETH
            </p>
          
            <FancyButton onClick={handleStartGame} disabled={gameStaring} className="w-full">
              {gameStaring ? (
                <>
                  {/* <Loader2 className="mr-2 h-4 w-4 animate-spin" /> */}
                  Starting...
                </>
              ) : (
                "Start Game"
              )}
            </FancyButton>

           
          </CardContent>
          <CardFooter>
            
            <Button variant="link" className="text-[#f7f7d9]" onClick={() => router.push('/play')}>Back</Button>
          </CardFooter>
        </Card>
        <Toaster />

      </div>
    )
  }

  if (gameState.status === "completed") {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-4">Game Completed!</h2>
            <p className="text-xl mb-6">Your Score: {gameState.playerScore}/{gameState.questions.length}</p>
            <div className="flex gap-4 justify-center">
              <FancyButton onClick={() => router.push("/")} className="w-full">Home</FancyButton>
       
            </div>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    )
  }

  if (!gameState.questions.length) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen px-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading questions...</p>
      </div>
    )
  }

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex]

  return (
    <div className="container px-4 py-8 max-w-2xl mx-auto">
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            Question {gameState.currentQuestionIndex + 1} of {gameState.questions.length}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Time Remaining:</span>
            <span>{Math.floor(gameState.timeRemaining / 60)}:{(gameState.timeRemaining % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        <Progress value={(gameState.timeRemaining / gameState.totalTime) * 100} />

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-6">{currentQuestion.question}</h2>

            <RadioGroup value={selectedAnswer?.toString()}>
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 rounded-lg border p-4 mb-2 cursor-pointer ${selectedAnswer === index ? "bg-primary/10 border-primary" : ""
                    }`}
                  onClick={() => handleAnswerSelect(index)}
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

        <div className="flex justify-between">
          <FancyButton onClick={() => handleQuestionNavigation("prev")}
            disabled={gameState.currentQuestionIndex === 0}>  

            <div className="flex">

            <ChevronLeft className="mr-2 h-4 w-4 mt-2" /> Previous
            </div>
            </FancyButton>
         

          <FancyButton onClick={() => handleQuestionNavigation("next")}
            disabled={gameState.currentQuestionIndex === gameState.questions.length - 1}
          > 
            <div className="flex">

           Next <ChevronRight className="ml-2 h-4 w-4 mt-2" />
            </div>
          </FancyButton>
        </div>
        <FancyButton onClick={handleSubmitAnswers} className="w-full" disabled={gameState.playerAnswers.some(a => a === null) || oneTimeSubmitted}>Submit Answers</FancyButton>
       
      </div>
      <Toaster />
    </div>
  )
}