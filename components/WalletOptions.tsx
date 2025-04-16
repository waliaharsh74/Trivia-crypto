"use client"
import React, { useEffect, useState } from 'react'
import {useConnect} from "wagmi"
const WalletOptions = () => {
    const [mounted, setMounted] = useState(false)
    const {connectors,connect}=useConnect()
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null
  return (
    <div>
        <div>
            {connectors?.map((connector)=>{
                console.log(connectors);
                return(
                  
                       
                        <button key={connector.uid} onClick={() => connect({ connector })}>   {connector.name}</button>
                       
                    
                )
            })}
        </div>
    </div>
  )
}

export default WalletOptions