
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import civicIntel from "../../assets/civicintel.hero.logo.png";
import civicIntelLogo from "../../assets/civicintellogo1.png";

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

  const shouldReduceMotion = useReducedMotion();

  // Typewriter heading animation
  useEffect(() => {
  // Don't run the typewriter animation when reduced motion is preferred.
  if (shouldReduceMotion) return;

  const delay = isDeleting
    ? visibleCharacters === 0
      ? 500
      : 50
    : visibleCharacters === fullHeading.length
      ? 1800
      : 65;

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
}, [visibleCharacters, isDeleting, shouldReduceMotion]);

  // Split the animated heading into its original text segments.
  const charactersToShow = shouldReduceMotion
    ? fullHeading.length
    : visibleCharacters;

  const animatedHeading = headingParts.map((part, index) => {
    const charactersBefore = headingParts
      .slice(0, index)
      .reduce((total, item) => total + item.text.length, 0);

    const charactersInSegment = Math.max(
      0,
      Math.min(
        part.text.length,
        charactersToShow - charactersBefore
      )
    );

    return {
      ...part,
      visibleText: part.text.slice(0, charactersInSegment),
    };
  });

  // Text entrance animation
  const textMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 25 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: {
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        },
      };

  // Image entrance animation
  const imageMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.92 },
        whileInView: { opacity: 1, scale: 1 },
        viewport: { once: true, amount: 0.2 },
        transition: {
          duration: 0.85,
          delay: 0.12,
          ease: [0.22, 1, 0.36, 1],
        },
      };

  const trustIndicators = [
    "Dual Pass Auditor QA",
    "Quality Datasets",
    "100% Attributed Records",
  ];

  return (
    <section
      id="home"
      className="scroll-mt-20 bg-[#0B3C5D] text-white"
    >
      <div
        className="
          mx-auto grid max-w-6xl grid-cols-1
          items-center justify-items-center gap-8
          px-5
          pt-28 pb-10
          sm:px-8 sm:pt-32 sm:pb-12
          lg:min-h-92.5 lg:grid-cols-2
          lg:justify-items-stretch lg:gap-10
          lg:px-12 lg:py-24
        "
      >
        {/* Hero content */}
        <motion.div
          {...textMotion}
          className="
            order-1 w-full min-w-0
            text-center
            lg:text-left
          "
        >
          <p className="mb-4 text-xs uppercase tracking-wide text-white">
            Nigeria · Health and education data
          </p>

          {/* Heading and typewriter effect */}
          <h1
            aria-label={fullHeading}
            className="
              mx-auto min-h-[3.6em] max-w-xl
              text-3xl font-bold leading-tight text-white
              sm:text-4xl
              lg:mx-0 lg:min-h-[2.4em] lg:text-5xl
            "
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

            {!shouldReduceMotion && (
              <span
                className="ml-1 inline-block animate-pulse text-white"
                aria-hidden="true"
              >
                |
              </span>
            )}
          </h1>

          <p
            className="
              mx-auto mt-4 max-w-lg
              text-sm leading-6 text-white
              lg:mx-0
            "
          >
            CivicIntel brings together sourced, dated, and verifiable
            indicators across all 36 states and the FCT, built for clarity,
            not headlines.
          </p>

          {/* Hero actions */}
          <div
            className="
              mt-6 flex flex-wrap justify-center gap-3
              lg:justify-start
            "
          >
            <a
              href="/explore"
              className="
                inline-flex items-center justify-center
                rounded-full bg-[#1F7A3F]
                px-5 py-2.5 text-sm font-semibold text-white
                transition-colors hover:bg-[#176331]
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-[#0B3C5D]
              "
            >
              Explore Data
            </a>

            <a
              href="#compare-states"
              className="
                inline-flex items-center justify-center
                rounded-full border border-white/30
                px-5 py-2.5 text-sm font-medium text-white
                transition-colors hover:bg-white/5
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-[#0B3C5D]
              "
            >
              Compare States
            </a>
          </div>

          {/* Trust indicators */}
          <div
            className="
              mt-8 flex flex-wrap justify-center gap-2
              lg:mt-10 lg:justify-start
            "
          >
            {trustIndicators.map((item) => (
              <span
                key={item}
                className="
                  inline-flex items-center gap-1.5
                  rounded-full border border-[#B7C5CB]
                  bg-white px-2.5 py-1.5
                  text-[10px] text-[#1F7A3F]
                  sm:text-xs
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-3.5 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 12.75 2.25 2.25L15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>

                {item}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Hero image */}
        <motion.div
          {...imageMotion}
          className="
            order-2 flex w-full min-w-0
            justify-center
            lg:justify-end
          "
        >
          <div
            className="
              relative h-64 w-full max-w-xs
              rounded-bl-[80px] rounded-tr-[80px]
              bg-[#0B3C5D]
              sm:h-80 sm:max-w-sm
              lg:h-120.25 lg:max-w-md
            "
          >
            <img
              src={civicIntel}
              alt="CivicIntel health and education data illustration"
              className="
                h-full w-full object-cover opacity-80
                rounded-bl-[80px] rounded-tr-[80px]
              "
            />

            <img
              src={civicIntelLogo}
              alt="CivicIntel logo"
              className="
                absolute -bottom-6 -right-3 z-10
                h-auto w-20 object-contain
                sm:-bottom-8 sm:w-28
                lg:w-32
              "
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
