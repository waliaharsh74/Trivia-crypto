import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WalletMultiButton } from "@/components/wallet-multi-button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="text-primary">CryptoTrivia</span>
          </Link>
          <WalletMultiButton />
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Crypto Trivia Challenge
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Test your knowledge, bet crypto, and win big in real-time multiplayer trivia games.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/play">
                  <Button size="lg" className="px-8">
                    Play Now
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button variant="outline" size="lg" className="px-8">
                    Leaderboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Trivia Challenges</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose from various topics and test your knowledge with AI-generated questions.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9" />
                    <path d="M12 16v4" />
                    <path d="m8 16 4 4 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Crypto Betting</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Place bets using SOL, ETH, and other cryptocurrencies to win big rewards.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Real-Time Gameplay</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Compete head-to-head with other players in real-time with Fluvio streams.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between md:py-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} CryptoTrivia. All rights reserved.
          </p>
          <nav className="flex gap-4 text-xs">
            <Link href="/terms" className="text-gray-500 hover:underline dark:text-gray-400">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:underline dark:text-gray-400">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
