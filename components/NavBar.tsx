"use client"

import React, { useRef, useState } from "react"
import gsap from "gsap"
import Link from "next/link"
import { WalletMultiButton } from '@/components/wallet-multi-button'

export function NavBar() {
    const titleRef = useRef<HTMLAnchorElement | null>(null)
    const [animIndex, setAnimIndex] = useState(0)

   
    const hoverAnims = [
        () => gsap.fromTo(titleRef.current, { scale: 1 }, { scale: 1.1, duration: 0.3, ease: "elastic.out(1,0.5)" }),
        () => gsap.fromTo(titleRef.current, { rotation: 0 }, { rotation: 10, duration: 0.2, yoyo: true, repeat: 1, ease: "sine.inOut" }),
        () => gsap.to(titleRef.current, { color: "#ffd54f", duration: 0.4, repeat: 1, yoyo: true }),
        () => gsap.fromTo(titleRef.current, { skewX: 0 }, { skewX: 10, duration: 0.3, yoyo: true, repeat: 1, ease: "power1.inOut" }),
    ]

    function handleNavHover() {
        const fn = hoverAnims[animIndex % hoverAnims.length]
        fn()
        setAnimIndex(i => i + 1)
    }

    return (
        <header className="border-b border-gray-800 bg-black">
            <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
                <Link
                    href="/"
                    ref={titleRef}
                    onMouseEnter={handleNavHover}
                    className="flex items-center gap-2 text-2xl font-extrabold text-[#f7f7d9] transition-colors duration-300"
                >
                    CryptoTrivia
                </Link>
                <WalletMultiButton />
            </div>
        </header>
    )
}
