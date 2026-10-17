
import civicIntel from "../assets/civicintel.hero.logo.png";

function Hero() {
  return (
    <section
      id="home"
      className="w-full overflow-hidden bg-[#0B3C5D] text-white shadow-md"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-8 py-12 sm:px-8 sm:py-16 md:px-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:px-18 lg:py-8">

        {/* Left: Hero Content */}
        <div className="min-w-0 w-full lg:w-153.25 lg:h-125.75 lg:max-w-full  mt-4">
          <h2 className="mb-4 text-xs  tracking-wider text-white/80 sm:text-sm">
            NIGERIA• HEALTH AND EDUCATION DATA 
          </h2>

          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Exploring Nigeria Through{" "}
            <span className="text-[#1F7A3F]">Health</span> &{" "}
            <span className="text-[#1F7A3F]">Education</span> Data
          </h1>
            
          <p className="mt-6 max-w-lg text-sm text-white/80 sm:text-sm">
            CivicIntel brings together sourced, dated, and verifiable
            indicators across all 36 states and the FCT, built for clarity,
            not headlines.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-[#1F7A3F] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#176331] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white "
            >
              Explore Data
            </a>

            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/50 px-4 py-2 text-xs font-medium transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Compare States
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 flex flex-wrap gap-3 lg:mt-14 ">
            {[
              "Dual Pass Auditor QA",
              "Quality Datasets",
              "100% Attributed Records",
            ].map((item) => (
              <div
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-2 py-1 text-xs  sm:text-xs bg-white text-[#65C98A]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4 shrink-0 text-[#65C98A]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 12.75 2.25 2.25L15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>

                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Hero Image */}
        <div className="flex min-w-0 items-center justify-center">
            <img
                src={civicIntel}
                alt="CivicIntel health and education data illustration"
                className="h-auto w-full max-w-md object-contain sm:max-w-lg lg:h-148.75 lg:w-122 lg:max-w-full"
            />
        </div>
      </div>
    </section>
  );
}

export default Hero;
