import { http, createConfig } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { injected, metaMask, safe } from 'wagmi/connectors'



export const config = createConfig({
    chains: [mainnet],
    connectors: [
        injected(),
        metaMask()

    ],
    transports: {
        [mainnet.id]: http(),
       
    },
})