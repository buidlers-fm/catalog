import GhostSubscribe from "app/components/GhostSubscribe"

export default function LandingPage() {
  return (
    <div className="min-h-screen pt-2 flex flex-col">
      <div className="relative w-full h-[768px]">
        <img
          src="/assets/images/hero_desert.png"
          alt="desert"
          className="w-full h-full opacity-30 absolute inset-0 object-cover object-center"
        />
      </div>
      <div className="absolute top-[540px] text-white text-lg lg:text-2xl font-semibold font-mulish tracking-wide">
        <div className="px-16 md:pl-24">
          <div className="mb-6 text-5xl font-bold leading-tight">
            <div>catalog is a space</div>
            <div>for book people.</div>
          </div>
        </div>
      </div>

      <div className="mt-16 mb-12 max-w-2xl mx-auto px-8 font-mulish text-lg font-semibold">
        <p className="my-4">
          It's a little place we can call home in a fractured internet: a place where people still
          collect paper books and lend them to each other, a place where people read the
          acknowledgments page and care what goes into the making of a book, a place where people
          get their best recommendations from fellow humans.
        </p>
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
      <GhostSubscribe />
    </div>
  )
}
