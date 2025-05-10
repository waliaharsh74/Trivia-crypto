"use client"

import React, { useEffect, useRef } from "react"
import gsap from "gsap"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"

gsap.registerPlugin(MotionPathPlugin)

export function SvgMotion() {
    const rectRef = useRef<SVGRectElement>(null)
    const pathRef = useRef<SVGPathElement>(null)

    useEffect(() => {
        if (rectRef.current && pathRef.current) {
            gsap.to(rectRef.current, {
                motionPath: {
                    path: pathRef.current,
                    align: pathRef.current,
                    alignOrigin: [0.5, 0.5],
                },
                duration: 20,
                ease: "none",
                repeat: -1,
            })
        }
    }, [])

    return (
        <div className=" w-20 h-20 flex items-center justify-center  overflow-hidden m-0 p-0 windmill absolute -top-[4.5rem] left-1/2 -translate-x-1/2 text-emerald-400 opacity-80" >
            <svg
                id="svg-stage"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="-4 -4 110 110"
                fill="none"
                className="w-3/5 max-w-[750px] overflow-visible"
            >
                <defs>
                    <linearGradient
                        id="grad-1"
                        x1="-4"
                        y1="-4"
                        x2="9"
                        y2="9"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0.2" stopColor="rgb(255, 135, 9)" />
                        <stop offset="0.5" stopColor="rgb(247, 189, 248)" />
                    </linearGradient>
                </defs>


                <path
                    ref={pathRef}
                    stroke="rgb(250,225,225)"
                    strokeWidth="4"
                    d="M50.5 50.5h50v50s-19.2 1.3-37.2-16.7S56 35.4 35.5 15.5C18.5-1 .5.5.5.5v50h50s25.6-.6 38-18 12-32 12-32h-50v100H.5S.2 80.7 11.8 68.2 40 49.7 50.5 50.5Z"
                />

              
                < rect
                    ref={rectRef}
                    fill="url(#grad-1)"
                    width="20"
                    height="20"
                    x="-4"
                    y="-4"
                    rx="2"
                />
            </svg>
        </div>
    )
}
