"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useBalance, useWaitForTransactionReceipt, useWriteContract, useAccount } from 'wagmi'

import { Loader2, Trophy, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"



import { CheckWinner, isBetValid } from "@/app/server"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import FancyButton from "@/components/ui/FancyButton"
import { WalletMultiButton } from "@/components/wallet-multi-button"
import Link from "next/link"
import { wagmiAbi } from "@/utils/Abt"



type WinnerData = {
  msg: string;
  creatorScore: number | null;
  joinerScore: number | null;
  winner: string | null;
  canResolve:boolean
};
export default function Winner() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const { isConnected, address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const balance = useBalance({
    address
  })
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS! as `0x${string}`

  const gameId = params.id as string
  const [data, setData] = useState<WinnerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const[resolving,setResolving]=useState<boolean>(false)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

  const result = useWaitForTransactionReceipt({
    hash: txHash || "0x",
    query: {
      enabled: !!txHash,
    },
    confirmations: 1,
  })
  useEffect(() => {

    setIsLoading(false)

  }, [])
  useEffect(() => {
      const ConfirmTransaction = async () => {
        try {
          if (result?.isFetched && result.status === 'success' && txHash) {
            toast({
              title: "Transaction confirmed ✅",
              description: "redirecting you to game"
            })
            console.log("Transaction confirmed ✅")
        
            
          }
          
        } catch (error: any) {
          console.log(error);
          toast({
            title: "Transaction Failed!",
            description: error?.message ||"Unknown Error"
          })
          setResolving(false)
        }
        
      }
    ConfirmTransaction()
  
    }, [result.isFetched,result.status])

  const handleResolve=async()=>{
    try {
      setResolving(true)
      const tx = await writeContractAsync({
              address: contractAddress,
              abi: wagmiAbi,
              functionName: "resolve",
              args: [gameId],
             
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
        description: "Some Error Occurred!",
        title: "Message!"
      })
      setResolving(false)
    }
  }
  useEffect(() => {
    async function fetchWinner() {
      try {
        const { msg, creatorScore, joinerScore, winner, canResolve } = await CheckWinner(gameId);

        setData({ msg, creatorScore, joinerScore, winner, canResolve });
        setIsLoading(false);


      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    }
    async function checkBetVaidity() {

      const check = await isBetValid(gameId, address);
      if (!check.isValid) {
        toast({
          description: check.msg,
          title: "Message!"
        })
        // router.push(`/play`)

      }

    }
    checkBetVaidity()
    fetchWinner();
  }, [gameId]);

  if (isLoading ||!data) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen px-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading game...</p>
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
              <Link href="/play" className="text-sm text-gray-500 hover:underline">
                Back to Home
              </Link>
            </CardFooter>
          </Card>
        </div>
      )
    }

  if (error  ) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen px-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="mt-4 text-lg">{error || "Bet Not Found"}</p>
        <Button variant="link" className="text-[#f7f7d9]" onClick={() => router.push("/play")}>
          <ChevronLeft className="mr-2" /> Back
        </Button>
      </div>
    );
  }
  

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Game Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>
              <span className="font-semibold">Game ID:</span> {gameId}
            </p>
            <p>
              <span className="font-semibold">Message:</span> {data.msg}
            </p>
          </div>

          <div className="space-y-2">
            <p>
              <span className="font-semibold">Creator Score:</span>{" "}
              {data.creatorScore !== null ? data.creatorScore : "—"}
            </p>
            <p>
              <span className="font-semibold">Challenger Score:</span>{" "}
              {data.joinerScore !== null ? data.joinerScore : "—"}
            </p>
            {data?.winner && <p className="flex items-center">
              <span className="font-semibold mr-2">Winner:</span>{" "}
              {data.winner ? (
                <span className="inline-flex items-center text-wrap text-sm">
                  {/* <Trophy className="text-yellow-500 mr-1" />  */}
                  {data.winner}
                </span>
              ) : (
                "—"
              )}
            </p>}
          </div>
          <FancyButton disabled={!data.canResolve || resolving}  onClick={handleResolve} className="mt-4 w-full"> 
            {resolving ? "Resolving..." : "Resolve Bet"}
          </FancyButton>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="link" className="text-[#f7f7d9]" onClick={() => router.push("/play")}>
            <ChevronLeft className="mr-2" /> Back
          </Button>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  );



}