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
import { useAccount } from "wagmi"
import { Skeleton } from "@/components/ui/skeleton"
import { getUniqueSlug } from "../server"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function PlayPage() {
  const router = useRouter()
  const [walletConnected, setWalletConnected] = useState(true)
  const [betAmount,setBetAmount]=useState('0.01')
  const [topic, setTopic] = useState('general')
  const [loading,setloading]=useState(true);
    const { isConnected ,address} = useAccount()
  

  useEffect(() => {
    setWalletConnected(isConnected)
    setloading(false)
    
  }, [])

  const handleCreateGame = async() => {
    if(!betAmount || !topic){
      toast({
        title:"Error!",
        description:"Amount and topic is required"
      })
  
      return
    }
    const {slug,msg} =await getUniqueSlug(betAmount,topic,address)
    if(slug.length==0){
      toast({
        title: "Error!",
        description: msg
      })

      return
    }

    router.push(`/game/${slug}`)
  }

  const handleJoinGame = (gameId: string) => {
  
    router.push(`/game/${gameId}`)
  }
  if(loading){
    return(
      <div className="container px-4 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-12 w-full max-w-md" />
          <Skeleton className="h-80 w-full max-w-3xl mx-auto" />
          <Skeleton className="h-80 w-full max-w-3xl mx-auto" />
        </div>

        <div className="mt-8 max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
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
      {/* <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Play CryptoTrivia</h1>
        <WalletMultiButton />
      </div> */}

      <Tabs defaultValue="create" className="w-full max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Game</TabsTrigger>
          <TabsTrigger value="join">Join Game</TabsTrigger>
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
                <Select defaultValue={topic} onValueChange={(value)=>setTopic(value)}>
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
                  <Input id="bet-amount" type="number" placeholder="0.01" min="0.01" step="0.01" value={betAmount} onChange={(e)=>setBetAmount(e.target.value)} />
                  <Select defaultValue="eth">
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eth">ETH</SelectItem>
                    
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-gray-500">A 3% fee will be deducted from your bet.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleCreateGame}>
                Create Game
              </Button>
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
                <Input id="game-id" placeholder="Enter game ID" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleJoinGame("game-id-from-input")}>
                Join Game
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    <Toaster/>

      {/* <div className="mt-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Active Games</h2>
        <div className="grid gap-4 md:grid-cols-2">
     
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Science Trivia</CardTitle>
              <CardDescription>Created 2 minutes ago</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p>Bet: 0.05 ETH</p>
                <p>Status: Waiting for opponent</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => handleJoinGame("sample-game-1")}>
                Join Game
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Crypto Knowledge</CardTitle>
              <CardDescription>Created 5 minutes ago</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p>Bet: 0.1 SOL</p>
                <p>Status: Waiting for opponent</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => handleJoinGame("sample-game-2")}>
                Join Game
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div> */}
    </div>
  )
}
