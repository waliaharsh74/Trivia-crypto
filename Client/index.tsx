"use client"
import {QueryClient} from "@tanstack/react-query"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const viemClient = createPublicClient({
    chain: mainnet,
    transport: http(),
})
export const queryClient =new QueryClient()