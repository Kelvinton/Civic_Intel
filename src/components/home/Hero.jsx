
import { useEffect, useState } from "react";
import civicIntel from "../../assets/civicintel.hero.logo.png";

const headingParts = [
  { text: "Exploring Nigeria Through " },
  { text: "Health", green: true },
  { text: " & " },
  { text: "Education", green: true },
  { text: " Data" },
];

const fullHeading = headingParts.map((part) => part.text).join("");

function Hero() {
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  
  useEffect(() => {
    let delay;

    if (isDeleting) {
      delay = visibleCharacters === 0 ? 500 : 50;
    } else {
      delay = visibleCharacters === fullHeading.length ? 1800 : 65;
    }

    const timeout = setTimeout(() => {
      if (!isDeleting && visibleCharacters === fullHeading.length) {
        setIsDeleting(true);
      } else if (isDeleting && visibleCharacters === 0) {
        setIsDeleting(false);
      } else {
        setVisibleCharacters((current) =>
          isDeleting ? current - 1 : current + 1
        );
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [visibleCharacters, isDeleting]);


  // Calculate visible characters for each text segment.
  const animatedHeading = headingParts.map((part, index) => {
    const charactersBefore = headingParts
      .slice(0, index)
      .reduce((total, item) => total + item.text.length, 0);

    const charactersInSegment = Math.max(
      0,
      Math.min(
        part.text.length,
        visibleCharacters - charactersBefore
      )
    );

    return {
      ...part,
      visibleText: part.text.slice(0, charactersInSegment),
    };
  });

  return (
    <section
      id="home"
      className="w-full overflow-hidden bg-[#0B3C5D] text-white shadow-md"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-8 py-12 sm:px-8 sm:py-12 md:px-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:px-16 lg:py-12 ">

        {/* Left: Hero Content */}
        <div className="mx-auto mt-4 flex min-w-0 w-full flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left lg:h-125.75 lg:w-153.25 lg:max-w-full">
          <h2 className="mb-4 text-xs tracking-wider text-white/80 sm:text-sm">
            NIGERIA • HEALTH AND EDUCATION DATA
          </h2>

          {/* Animated heading */}
          <h1
            aria-label={fullHeading}
            className="min-h-[3.6em] text-center text-4xl font-bold leading-tight sm:text-5xl lg:min-h-[2.4em] lg:text-left lg:text-6xl"
          >
            {animatedHeading.map((part, index) => (
              <span
                key={index}
                className={part.green ? "text-[#1F7A3F]" : ""}
                aria-hidden="true"
              >
                {part.visibleText}
              </span>
            ))}

            <span
              className="ml-1 inline-block animate-pulse text-white"
              aria-hidden="true"
            >
              |
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-md text-white/80">
            CivicIntel brings together sourced, dated, and verifiable
            indicators across all 36 states and the FCT, built for clarity,
            not headlines.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <a
              href="/explore"
              className="inline-flex items-center justify-center rounded-full bg-[#1F7A3F] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#176331] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Explore Data
            </a>

            <a
              href="#compare-states"
              className="inline-flex items-center justify-center rounded-full border border-white/50 px-4 py-2 text-xs font-medium transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Compare States
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 flex flex-wrap justify-center gap-3 lg:mt-14 lg:justify-start">
            {[
              "Dual Pass Auditor QA",
              "Quality Datasets",
              "100% Attributed Records",
            ].map((item) => (
              <div
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white px-2 py-1 text-xs text-[#65C98A]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4 shrink-0 text-[#65C98A]"
                  aria-hidden="true"
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
            className="h-auto w-full max-w-md object-contain sm:max-w-lg lg:h-130.75 lg:w-122 lg:max-w-full"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
