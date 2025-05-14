"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletMultiButton } from "@/components/wallet-multi-button"
import { Skeleton } from "@/components/ui/skeleton"
import { getUniqueSlug, createGame } from "../server"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useBalance, useWaitForTransactionReceipt, useWriteContract, useAccount } from 'wagmi'
import { wagmiAbi } from "@/utils/Abt"
import { parseEther } from 'viem'
import FancyButton from "@/components/ui/FancyButton"

export default function PlayPage() {
  const router = useRouter()
  const [gameId, setGameId] = useState('');
  const [betAmount, setBetAmount] = useState('0.01')
  const [topic, setTopic] = useState('general')
  const [creating, setCreating] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [slugRef, setSlugRef] = useState("")
  const [loading, setloading] = useState(true);
  const { isConnected, address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const balance = useBalance({
    address
  })
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS! as `0x${string}`



  const result = useWaitForTransactionReceipt({
    hash: txHash || "0x",
    query: {
      enabled: !!txHash,
    },
    confirmations: 1,
  })
  useEffect(() => {

    setloading(false)

  }, [])

  useEffect(() => {
    const TransferToPlay = async () => {
      try {
        if (result?.isFetched && result.status === 'success' && txHash) {
          const res = await createGame(betAmount, topic, slugRef, address, txHash)
          console.log(res);
          toast({
            title: "Transaction confirmed ✅",
            description: "redirecting you to game"
          })
          console.log("Transaction confirmed ✅")
          router.push(`/game/${slugRef}`)
          
        }
        
      } catch (error: any) {
        console.log(error);
        toast({
          title: "Transaction Failed!",
          description: error?.message ||"Unknown Error"
        })
        setCreating(false)
      }
      
    }
    TransferToPlay()

  }, [result.isFetched,result.status])

  const handleCreateGame = async () => {

    if (!betAmount || !topic) {
      toast({
        title: "Error!",
        description: "Amount and topic is required"
      })

      return
    }
    console.log(balance?.data?.formatted);
    if (!balance || balance.data && balance?.data?.formatted <= betAmount) {
      toast({
        title: "Error!",
        description: "Insufficent Balance to place bet"
      })

    }

    try {

      setCreating(true)

      const { slug, msg } = await getUniqueSlug()

      if (slug.length == 0) {
        toast({
          title: "Error!",
          description: msg
        })

        return
      }
      setSlugRef(slug)

      const tx = await writeContractAsync({
        address: contractAddress,
        abi: wagmiAbi,
        functionName: "createBet",
        args: [slug, topic],
        value: parseEther(betAmount),
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

    } catch (error) {
      console.log(error);
      toast({
        title: "Error!",
        description: "Unable to create game right now"
      })
      setCreating(false)
    }

  }

  const handleJoinGame = () => {
    if (!gameId) {
      toast({ title: "Message!", description: "Please enter Game Id to continue" })
      return
    }
    router.push(`/game/${gameId}`)
  }
  const handleCheckWinner = () => {
    if(!gameId){toast({title:"Message!",description:"Please enter Game Id to continue"})
      return
    }
      

    router.push(`/winner/${gameId}`)
  }
  if (loading) {
    return (
      <div className="container px-4 py-12 space-y-8">
        

        <div className="space-y-4">
         
          <Skeleton className="h-80 w-full max-w-3xl mx-auto" />
         
        </div>

        
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen px-4 py-12">
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

  return (
    <div className="container px-4 py-12">
    

      <Tabs defaultValue="create" className="w-full max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Game</TabsTrigger>
          <TabsTrigger value="join">Join Game</TabsTrigger>
          <TabsTrigger value="winner">Winner</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Game</CardTitle>
              <CardDescription>Set up a new trivia game and invite another player to join.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Select defaultValue={topic} onValueChange={(value) => setTopic(value)}>
                  <SelectTrigger id="topic">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Knowledge</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bet-amount">Bet Amount</Label>
                <div className="flex space-x-2">
                  <Input id="bet-amount" type="number" placeholder="0.01" min="0.01" step="0.01" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} />
                  <Select defaultValue="eth">
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eth">ETH</SelectItem>

                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-[#f7f7d9]">A 3% platform fee will be deducted from your bet.</p>
              </div>
            </CardContent>
            <CardFooter>
              <FancyButton onClick={handleCreateGame} disabled={creating} className="w-full">
                {creating ? "Waiting for Confirmation..." : "Create Game"}
              </FancyButton>
              
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="join">
          <Card>
            <CardHeader>
              <CardTitle>Join an Existing Game</CardTitle>
              <CardDescription>Enter a game ID to join an existing trivia game.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="game-id">Game ID</Label>
                <Input id="game-id" value={gameId} onChange={(e) => setGameId(e.target.value)} placeholder="Enter game ID" />
              </div>
            </CardContent>
            <CardFooter>
              <FancyButton onClick={handleJoinGame} className="w-full"> Join Game</FancyButton>
              
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="winner">
          <Card>
            <CardHeader>
              <CardTitle>Check Winner of Existing Game</CardTitle>
              <CardDescription>Enter a game ID to check winner of an existing trivia game.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="game-id">Game ID</Label>
                <Input id="game-id" value={gameId} onChange={(e) => setGameId(e.target.value)} placeholder="Enter game ID" />
              </div>
            </CardContent>
            <CardFooter>
              <FancyButton onClick={handleCheckWinner} className="w-full">Check Winner</FancyButton>
             
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />

    
    </div>
  )
}
