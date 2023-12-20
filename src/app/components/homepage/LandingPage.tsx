"use client"

import { useEffect } from "react"

export default function LandingPage() {
  useEffect(() => {
    const script = document.createElement("script")

    script.src = "https://cdn.jsdelivr.net/ghost/signup-form@~0.1/umd/signup-form.min.js"
    script.async = true

    script.dataset.buttonColor = "hsl(45, 100%, 55%)"
    script.dataset.buttonTextColor = "hsl(45, 4%, 12%)"
    script.dataset.site = "https://news.catalog.fyi/"
    const el = document.getElementById("ghost-signup")
    el?.appendChild(script)

    return () => {
      el?.removeChild(script)
    }
  }, [])

  return (
    <div className="min-h-screen pt-2 flex flex-col">
      <div className="relative w-full h-[768px]">
        <img
          src="/assets/images/hero_desert.png"
          alt="desert"
          className="w-full h-full opacity-30 absolute inset-0 object-cover object-center"
        />
      </div>
      <div className="absolute top-96 text-white text-lg lg:text-2xl font-semibold font-mulish tracking-wide">
        <div className="w-full xs:w-3/4 sm:w-2/3 md:w-1/2 px-16 md:pl-24 lg:px-24">
          <div className="my-6">
            out in the desert, where civilization seemed all but forgotten for hundreds of years...
          </div>
          <div className="my-6">we never thought we'd find a whole world in a place like this.</div>
          <div className="my-6">look: what grew where it looked like nothing could grow.</div>
        </div>
      </div>

      <div className="mt-24 mb-12 max-w-2xl mx-auto px-8 font-mulish text-lg font-semibold">
        <div className="mb-6 text-4xl font-bold">catalog is a space for book people.</div>
        <p className="my-4">
          It's a little place we can call home in a fractured internet: a place where people still
          collect paper books and lend them to each other, a place where people read the
          acknowledgments page and get their best recommendations from fellow humans.
        </p>
        <p className="my-4">It may not be much, but it's ours.</p>
        <p className="my-4">
          catalog is currently in closed alpha (as of winter 2023-2024).{" "}
          <a href="https://tally.so/r/mZ20aA" className="cat-underline">
            Sign up for the waitlist
          </a>{" "}
          and we'll get you in as soon as we can.
        </p>
        <div className="mt-32 mb-4 font-mulish text-4xl font-bold">
          catalog is built with love by...
        </div>
      </div>

      <div className="mx-auto mb-12 flex flex-col md:flex-row font-mulish">
        <div className="flex-1 md:mr-16">
          <img
            src="/assets/images/rory.png"
            alt="rory"
            className="shrink-0 mr-2 w-48 h-48 rounded-full opacity-90"
          />
          <div className="mt-6">
            <div className="mb-2 text-2xl font-bold">rory</div>
            <div>developer • agent of order</div>
            <div>brooklyn, ny</div>
            <div className="mt-2 w-64">
              Rory builds the catalog app. At the (imaginary) catalog cafe, she tends the boba bar
              late into the night, where she will prepare you a warm drink and listen to your
              troubles.
            </div>
          </div>
        </div>
        <div className="flex-1 md:ml-12 mt-16 md:mt-0">
          <img
            src="/assets/images/glenn.png"
            alt="glenn"
            className="shrink-0 mr-2 w-48 h-48 rounded-full"
          />
          <div className="mt-6">
            <div className="mb-2 text-2xl font-bold">glenn</div>
            <div>network • agent of chaos</div>
            <div>oakland, ca</div>
            <div className="mt-2 w-64">
              Glenn builds the catalog community. At the (imaginary) catalog cafe, he introduces you
              to another friend at the bar.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 my-4 mx-auto px-8 font-mulish text-lg">
        Subscribe to catalog news for the latest updates.
      </div>
      <div
        id="ghost-signup"
        className="mx-auto"
        style={{
          minHeight: "58px",
          maxWidth: "340px",
          width: "100%",
        }}
      />
    </div>
  )
}
