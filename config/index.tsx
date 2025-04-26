import { http, createConfig } from 'wagmi'
import { base, mainnet,sepolia } from 'wagmi/chains'
import { injected, metaMask, safe } from 'wagmi/connectors'



export const config = createConfig({
    chains: [sepolia],
    connectors: [
        injected(),
        metaMask()

    ],
    transports: {
        [sepolia.id]: http(),
       
    },
})