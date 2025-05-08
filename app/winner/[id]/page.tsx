"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { Loader2, Trophy, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useAccount } from "wagmi"


import { CheckWinner, isBetValid } from "@/app/server"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"



type WinnerData = {
  msg: string;

  creatorScore: number | null;
  joinerScore: number | null;
  winner: string | null;
};
export default function Winner() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const { isConnected, address } = useAccount()
  const gameId = params.id as string
  const [data, setData] = useState<WinnerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchWinner() {
      try {
        const { msg, creatorScore, joinerScore, winner } = await CheckWinner(gameId);

        setData({ msg, creatorScore, joinerScore, winner });

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    async function checkBetVaidity() {

      const check = await isBetValid(gameId, address);
      if (!check.isValid) {
        toast({
          description: check.msg,
          title: "Error!"
        })
        // router.push(`/play`)

      }

    }
    checkBetVaidity()
    fetchWinner();
  }, [gameId]);
  if (isLoading) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen px-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading game...</p>
      </div>
    )
  }

  if (error || !data) {
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
                <span className="inline-flex items-center">
                  <Trophy className="text-yellow-500 mr-1" /> {data.winner}
                </span>
              ) : (
                "—"
              )}
            </p>}
          </div>
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