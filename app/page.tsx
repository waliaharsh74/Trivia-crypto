"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { Flip } from "gsap/Flip"
import { TextPlugin } from "gsap/TextPlugin"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SvgMotion } from "./svgs"
import OrangeAnimation from "./svgs/OrangeAnimation"
import FancyButton from "@/components/ui/FancyButton"

gsap.registerPlugin(Flip, TextPlugin)

export default function Home() {
  const container = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (!container.current) return

    const ctx = gsap.context(() => {

      const c = gsap.utils.selector(container)


      gsap.fromTo(
        c(".char-c"),
        { rotation: 180, opacity: 0 },
        { rotation: 0, opacity: 1, ease: "back.out(1.7)", duration: 0.7 }
      )

      gsap.fromTo(
        c(".svg-pop"),
        { scale: 0, opacity: 0, x: -40 },
        { scale: 1, opacity: 1, x: 0, ease: "back.out(2)", duration: 0.5, delay: 0.5 }
      )


      const tlR = gsap.timeline({ delay: 1 })
      tlR.fromTo(
        c(".char-r"),
        { y: -120, opacity: 0, scale: 2 },
        { y: 0, opacity: 1, scale: 1, ease: "power4.out", duration: 0.6 }
      )
      tlR.to(
        c(".svg-pop"),
        {
          x: 200, y: -200, rotation: -90, opacity: 0, duration: 0.7, ease: "back.in(1.7)", onComplete: () => {
            gsap.set(c(".svg-pop"), { display: "none" })
          },
        },
        "-=0.5"
      )



      gsap.fromTo(
        c(".char-y"),
        { y: -200, opacity: 0 },
        { y: 0, opacity: 1, ease: "bounce.out", duration: 0.9, delay: 1.2 }
      )


      const chars: string[] = ['p', 't', 'o'];

      chars.forEach((ch: string, i: number) => {
        gsap.fromTo(
          c(`.slot-${ch}`),
          {
            text: { value: "X", delimiter: "" },
            display: "none"
          },
          {
            text: { value: ch, delimiter: "" },
            ease: "none",
            duration: 0.8,

            delay: 1.6 + i * 0.2,
            display: "block"
          },

        );
      });



      const tlTrivia = gsap.timeline({ delay: 2.4 })
      tlTrivia.from(c(".char-T"), { y: 120, opacity: 0, duration: 0.6, ease: "back.out(1.7)" })
      tlTrivia.from(c(".char-r2"), { rotationY: 90, opacity: 0, duration: 0.5 }, "-=0.3")


      tlTrivia.from(c(".svg-i"), { scale: 0, opacity: 0, duration: 0.4, ease: "back.out" })
      tlTrivia.to(
        c(".svg-i"),
        { scale: 0, opacity: 0, duration: 0.3, ease: "back.in" },
        "+=0.2"
      )
      tlTrivia.set(c(".svg-i"), {
        display: "none",
      })

      tlTrivia.to(c(".svg-i")[0].parentElement, {
        width: "24px",
        duration: 0.3,
        ease: "power1.inOut",
      }, "<");
      tlTrivia.from(c(".char-i"), { scale: 3, opacity: 0, duration: 0.4, ease: "power2.out" })


      tlTrivia.fromTo(
        c(".char-a"),
        { rotation: -90, transformOrigin: "left top", opacity: 0 },
        { rotation: 0, opacity: 1, duration: 0.6, ease: "back.out(1.4)" }
      )


      gsap.to(c(".windmill"), { rotation: 360, repeat: -1, ease: "linear", duration: 3 })


      gsap.to(c(".char-i"), {
        rotationX: 360,
        repeat: -1,
        ease: "power1.inOut",
        duration: 1.2,
        transformOrigin: "center bottom",
        repeatDelay: 3,

      })
    }, container)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={container}
      className="min-h-screen flex flex-col items-center justify-center bg-black text-[clamp(2rem,10vw,8rem)] font-extrabold text-[#f7f7d9] overflow-hidden"
    >

      <div className="relative flex items-end leading-none space-x-2">
        <span className="char-c inline-block">C</span>
        <svg
          className="svg-pop w-20 h-20 text-pink-400"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <circle cx="50" cy="50" r="50" />
        </svg>
        <span className="char-r inline-block">r</span>
        <span className="char-y inline-block">y</span>
        <span className="slot-p inline-block">p</span>
        <span className="slot-t inline-block">t</span>
        <span className="slot-o inline-block">o</span>


        <SvgMotion />


      </div>


      <div className="flex items-end leading-none space-x-2 text-[clamp(1.5rem,6vw,5rem)] mt-4">
        <span className="char-T inline-block">T</span>
        <span className="char-r2 inline-block">r</span>
        <span className="char-v inline-block">v</span>
        <div className="relative w-[3ch]">
          <svg
            className="svg-i absolute inset-0 w-full h-full text-teal-400"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <rect x="30" y="0" width="40" height="100" rx="10" />
          </svg>

          <OrangeAnimation />
          <span className="char-i inline-block  inset-0">i</span>
        </div>
        <span className="char-a inline-block">a</span>
      </div>
      <div className="">
        <Link href="/play">
          {/* <Button className="
      px-8 py-8 
      text-[clamp(1rem,4vw,2rem)] 
      text-transparent bg-clip-text 
      bg-gradient-to-r from-[#f7f7d9] via-[#ffeb99] to-[#ffd54f] 
      hover:from-[#ffd54f] hover:to-[#ffeb99] 
      border-2 border-[#f7f7d9] 
      rounded-full 
      shadow-lg 
      transition-all duration-300 ease-in-out 
      hover:scale-105 active:scale-95
    "
          >
            Play Now
          </Button> */}
          <FancyButton  >
            Play Now
          </FancyButton>
        </Link>
      </div>



    </div>
  )
}
