
import { motion } from "framer-motion";
import {
  revealVariants,
  staggerContainer,
  useMotionSettings,
} from "../../animation.js";

const snapshotCards = [
  {
    label: "STATES",
    value: "36",
    title: "States",
    description: "Plus 1 Federal Capital Territory",
    verification: "Aligned with Nigerian Constitution schedule",
  },
  {
    label: "HEALTH INDICATORS",
    value: "14",
    title: "Audited Metrics Map",
    description: "Primary care density & bed capacity",
    verification: "Provenance check complete",
  },
  {
    label: "EDUCATION INDICATORS",
    value: "12",
    title: "State-wide metrics tracker",
    description: "Literacy, UBE enrolment, teacher ratios",
    verification: "Schedule alignment verified",
  },
  {
    label: "PUBLIC PROVENANCE",
    value: "100%",
    title: "Verified Citations",
    description: "No synthesized rankings or black-box metrics",
    verification: "Open-source and public-domain data only",
  },
];

function NationalSnapshot() {
  const motionSettings = useMotionSettings();

  return (
    <section className="border-b border-gray-400 bg-[#dce3e6] px-5 py-8 text-black sm:px-8 lg:px-18">
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <div className="mb-5 flex items-center gap-2">
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

          <motion.h2
            {...motionSettings}
            variants={revealVariants}
            className="text-lg font-bold tracking-wide sm:text-3xl"
          >
            NATIONAL SNAPSHOT
          </motion.h2>
        </div>

        {/* Scroll animation for the cards */}
        <motion.div
          {...motionSettings}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-3 px-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {snapshotCards.map((card) => (
            <motion.article
              key={card.label}
              variants={revealVariants}
              whileHover={{
                y: -8,
                transition: {
                  duration: 0.25,
                  ease: "easeOut",
                },
              }}
              className="
                group flex min-w-0 flex-col
                rounded-lg border-l-4 border-[#0B3C5D]
                bg-white p-4 text-[#171717] shadow-sm
                transition-[border-color,box-shadow]
                duration-300 ease-out
                hover:border-[#1F7A3F]
                hover:shadow-xl
                motion-reduce:transform-none
              "
            >
              {/* Card label */}
              <p className="text-[10px] font-medium tracking-wide text-[#1F7A3F]">
                {card.label}
              </p>

              {/* Statistic value */}
              <p
                className="
                  mt-2 text-2xl font-bold leading-none
                  transition-colors duration-300
                  group-hover:text-[#1F7A3F]
                  motion-reduce:transition-none
                "
              >
                {card.value}
              </p>

              {/* Card title */}
              <h3 className="mt-2 text-xs font-medium">
                {card.title}
              </h3>

              {/* Description */}
              <p className="mt-1 min-h-8 text-[11px] leading-4 text-gray-500">
                {card.description}
              </p>

              {/* Verification */}
              <div className="mt-3 border-t border-gray-200 pt-2">
                <p
                  className="
                    flex items-start gap-1 text-[10px] leading-4 text-[#1F7A3F]
                    transition-transform duration-300
                    group-hover:translate-x-1
                    motion-reduce:transition-none
                  "
                >
                  <span aria-hidden="true">✓</span>
                  <span>{card.verification}</span>
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default NationalSnapshot;
