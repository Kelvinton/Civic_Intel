
import { motion, useReducedMotion } from "framer-motion";
import {
  revealVariants,
  useMotionSettings,
} from "../../animation.js";

function FeaturedRelease() {
  const motionSettings = useMotionSettings();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="featured-release"
      className="bg-[#91AAB7] px-5 py-10 text-[#17252C] sm:px-8 sm:py-12 lg:px-20 lg:py-14"
    >
      <div className="mx-auto max-w-6xl">
        {/* Only the content animates */}
        <motion.div
          variants={revealVariants}
          {...motionSettings}
        >
          {/* Section label */}
          <div className="flex items-center gap-2">
              <motion.span
              className="relative h-2.5 w-2.5 shrink-0 rounded-full bg-[#1F7A3F]"
              animate={{
                opacity: [1, 0.7, 1],
                scale: [1, 1.15, 1],
                boxShadow: [
                  "0 0 4px rgba(31, 122, 63, 0.4)",
                  "0 0 12px rgba(31, 122, 63, 0.9)",
                  "0 0 4px rgba(31, 122, 63, 0.4)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <p className="text-base font-semibold uppercase tracking-wide text-black/65 sm:text-xl">
              Featured State Release
            </p>
          </div>

          {/* Release details */}
          <div className="mt-7 px-6">
            <h2 className="text-sm font-bold uppercase leading-6 sm:text-base">
              State Profile Update · September 2026
            </h2>

            <p className="mt-3 text-sm font-medium text-[#1F7A3F] sm:text-base">
              Lagos State: Health &amp; Education Indicators Refreshed
            </p>

            <p className="mt-4 max-w-3xl text-xs leading-6 text-[#344750] sm:text-sm">
              Updated ANC coverage, primary completion, and budget allocation
              figures are now verified and published for the state.
            </p>

            {/* View profile button */}
            <motion.a
              href="/states/lagos"
              whileHover={
                shouldReduceMotion ? undefined : { scale: 1.03 }
              }
              whileTap={
                shouldReduceMotion ? undefined : { scale: 0.98 }
              }
              className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#1F7A3F] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#176331] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B3C5D]"
            >
              View Lagos Profile

              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white p-1 text-[#0B3C5D] shadow-md shadow-black/20"
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturedRelease;
