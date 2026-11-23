
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const headingParts = [
  { text: "Know Your " },
  { text: "Vote,", green: true },
  { text: " Own Your " },
  { text: "Voice", green: true },
];

const fullHeading = headingParts.map((part) => part.text).join("");

function VoterEducation() {
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openFaq, setOpenFaq] = useState("");

  const shouldReduceMotion = useReducedMotion();

  // Typewriter heading animation
  useEffect(() => {
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

  // Split the animated heading into its original text segments
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

  return (
    <main className="min-h-screen bg-[#F8F7F3] text-[#20272B]">

        {/* HERO SECTION */}
        <section className="bg-white px-5 py-12 sm:px-8 lg:py-16">
            <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 mt-10">

                {/* HERO TEXT */}
                <motion.div {...textMotion}>
                    <motion.span
                        animate={
                            shouldReduceMotion
                            ? {}
                            : {
                                scale: [1, 1.08, 1],
                                }
                        }
                        transition={{
                            duration: 1.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="inline-block rounded-full border border-[#1F7A3F]/20 bg-[#DDF1E5] px-4 py-2 text-xs  uppercase tracking-wide text-[#1F7A3F] mt-12 shadow-[0_4px_14px_rgba(31,122,63,0.30)]"
                        >
                        Voter Education
                    </motion.span>

                    <h1
                    aria-label={fullHeading}
                    className="mt-4 min-h-[2.5em] text-3xl font-bold leading-tight tracking-tight text-[#0B3C5D] sm:text-4xl"
                    >
                    {animatedHeading.map((part, index) => (
                        <span
                        key={index}
                        className={part.green ? "text-[#1F7A3F]" : ""}
                        >
                        {part.visibleText}
                        </span>
                    ))}

                    {!shouldReduceMotion && (
                        <span
                        aria-hidden="true"
                        className="ml-0.5 inline-block animate-pulse text-[#1F7A3F]"
                        >
                        |
                        </span>
                    )}
                    </h1>

                    <p className="mt-4 max-w-md text-sm leading-6 text-gray-600">
                    Everything you need to participate fully in Osun's
                    state democratic process from registering to vote,
                    to understanding your rights at the polls.
                    </p>

                    {/* STATISTICS */}
                    <div className="mt-7 flex flex-wrap gap-8">
                    <div>
                        <p className="text-xl font-bold text-[#1F7A3F]">0</p>
                        <p className="mt-1 text-[9px] uppercase tracking-wider text-gray-400">
                        Articles Published
                        </p>
                    </div>

                    <div>
                        <p className="text-xl font-bold text-red-500">0</p>
                        <p className="mt-1 text-[9px] uppercase tracking-wider text-gray-400">
                        Video Tutorials
                        </p>
                    </div>

                    <div>
                        <p className="text-xl font-bold text-[#0B3C5D]">68</p>
                        <p className="mt-1 text-[9px] uppercase tracking-wider text-gray-400">
                        Users Reached
                        </p>
                    </div>
                    </div>
                </motion.div>

                {/* FEATURED CARD */}
                <motion.div
                    {...(shouldReduceMotion
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
                        })}
                    className="flex justify-center md:justify-end"
                >
                    <div className="relative flex min-h-[320px] w-full max-w-md flex-col justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#218653] via-[#08705F] to-[#0B3C5D] p-8 text-white shadow-lg">

                    <motion.div
                        animate={
                            shouldReduceMotion
                            ? {}
                            : {
                                scale: [1, 1.08, 1],
                                }
                        }
                        transition={{
                            duration: 1.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }} className="absolute right-5 top-5 h-22 w-22 rounded-md bg-white/10"
                    />

                    <span className="mb-3 w-fit rounded-sm bg-[#F3B63F] px-2 py-2 text-[10px] font-bold uppercase text-white">
                        Featured
                    </span>

                    <h2 className="max-w-[220px] text-xl font-bold leading-snug">
                        Voter education content coming soon
                    </h2>

                    <p className="mt-3 max-w-[230px] text-xs leading-5 text-white/80">
                        Foundational voter education resources will appear
                        here once published by the admin.
                    </p>
                    </div>
                </motion.div>

            </div>
        </section>


        {/* BROWSE BY TOPIC */}
        <section className="bg-[#D8E6EC] px-5 py-5 sm:px-8">
            <div className="mx-auto flex max-w-5xl items-center justify-start gap-3">
                <span className="h-px w-8 bg-[#0B3C5D]/30" />

                <h2 className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#0B3C5D]/70">
                Browse by Topic
                </h2>
            </div>
        </section>


        {/* LATEST ARTICLES AND FAQ */}
        <section className="bg-[#F8F7F3] px-5 py-10 sm:px-8 lg:py-14">
            <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-8 md:grid-cols-[1.6fr_1fr]">

                {/* LATEST ARTICLES */}
                <div>
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-[#0B3C5D]/30" />
                    <h2 className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#0B3C5D]/70">
                        Latest Articles
                    </h2>
                    </div>

                    
                </div>

                <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-gray-100 bg-white px-5 py-7 text-center shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700">
                    No articles yet
                    </h3>

                    <p className="mt-2 text-xs text-gray-400">
                    Voter education articles published by the admin will appear here.
                    </p>
                </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="space-y-6">

                {/* FREQUENTLY ASKED QUESTIONS */}
                <div>
                    <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="h-px w-5 bg-[#0B3C5D]/30" />
                        <h2 className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#0B3C5D]/70">
                        Frequently Asked Questions
                        </h2>
                    </div>

                    <button className="text-[10px] font-medium text-[#0B3C5D]">
                        See all
                    </button>
                    </div>

                    <div className="space-y-2">
                    {[
                        {
                        question: "Who is eligible to vote in Nigeria?",
                        answer:
                            "Voter eligibility and registration requirements are determined by Nigerian electoral law and INEC guidelines.",
                        },
                        {
                        question: "How do I register to vote?",
                        answer:
                            "INEC provides voter registration information and guidance through its official channels.",
                        },
                        {
                        question: "What should I bring to my polling unit?",
                        answer:
                            "Check the latest INEC guidance before election day for the requirements that apply to voters.",
                        },
                        {
                        question: "How can I find my polling unit?",
                        answer:
                            "Use INEC's official voter information services to confirm your polling unit before election day.",
                        },
                    ].map((faq, index) => (
                        <div
                        key={index}
                        className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                        >
                        <button
                            type="button"
                            onClick={() =>
                            setOpenFaq(openFaq === index ? -1 : index)
                            }
                            className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
                        >
                            <span className="text-[11px] font-medium text-gray-700">
                            {faq.question}
                            </span>

                            <span className="text-sm text-[#0B3C5D]">
                            {openFaq === index ? "×" : "+"}
                            </span>
                        </button>

                        {openFaq === index && (
                            <div className="border-t border-gray-100 px-3 py-3">
                            <p className="text-[10px] leading-5 text-gray-500">
                                {faq.answer}
                            </p>
                            </div>
                        )}
                        </div>
                    ))}
                    </div>
                </div>

                {/* QUICK VIDEO TUTORIALS */}
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <h3 className="text-[10px] font-medium text-gray-600">
                    Quick Video Tutorials
                    </h3>

                    <div className="mt-3 flex min-h-[75px] items-center justify-center rounded-md bg-[#F8F9FA] px-3 text-center">
                    <p className="text-[10px] text-gray-400">
                        No video tutorials available yet.
                    </p>
                    </div>

                    <button className="mt-3 text-[10px] font-medium text-[#0B3C5D]">
                    View all 0 videos →
                    </button>
                </div>

                </div>
            </div>
        </section>


        {/* DOWNLOADABLE RESOURCES */}
        <section className="bg-[#F8F7F3] px-5 pb-14 pt-6 sm:px-8 lg:pb-20">
            <div className="mx-auto max-w-5xl">

                {/* SECTION HEADING */}
                <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-3">
                    <span className="h-px w-8 bg-[#0B3C5D]/30" />
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#0B3C5D]/70">
                        Upcoming Resources
                    </p>
                    </div>

                    <h2 className="text-xl font-bold text-[#20272B] sm:text-2xl">
                    Guides, Infographics &amp; Toolkits
                    </h2>
                </div>

                <span className="text-[10px] font-medium text-[#0B3C5D]">
                    View all resources →
                </span>
                </div>

                {/* RESOURCE CARDS */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {/* RESOURCE 1 */}
                <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#E5F0D5] to-[#B8D6A0] p-5">
                    <div className="rounded-lg bg-[#1F7A3F] p-5 text-center text-white shadow-md">
                        <p className="text-xs font-bold uppercase">Ekiti Decides</p>
                        <p className="mt-1 text-lg font-bold">Are You Ready?</p>
                        <p className="mt-2 text-[9px]">Your guide to voting</p>
                    </div>
                    </div>

                    <div className="p-4">
                    <span className="text-[8px] font-semibold uppercase text-[#0B3C5D]">
                        PDF Guide
                    </span>

                    <h3 className="mt-2 text-sm font-bold leading-snug text-[#20272B]">
                        Ekiti Decides Tomorrow: Are You Ready to Vote?
                    </h3>

                    <p className="mt-2 text-[10px] leading-5 text-gray-500">
                        A practical guide to preparing for an election, understanding
                        your voting rights and participating responsibly.
                    </p>

                    <p
                    className="mt-4 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-center text-[10px] font-medium text-gray-400"
                    aria-label="PDF resource not yet available"
                    >
                        PDF resource coming soon
                    </p>
                    </div>
                </article>

                {/* RESOURCE 2 */}
                <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex h-36 items-center justify-center bg-[#0B3C5D] p-5">
                    <div className="max-w-[220px] text-center text-white">
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-[#9BC9B0]">
                        Civic Technology
                        </p>
                        <p className="mt-3 text-lg font-bold leading-tight">
                        The Future of Civic Technology in Africa
                        </p>
                    </div>
                    </div>

                    <div className="p-4">
                    <span className="text-[8px] font-semibold uppercase text-[#0B3C5D]">
                        PDF Guide
                    </span>

                    <h3 className="mt-2 text-sm font-bold leading-snug text-[#20272B]">
                        The Future of Civic Technology in Africa: Nigeria's Digital
                        Governance Challenge
                    </h3>

                    <p className="mt-2 text-[10px] leading-5 text-gray-500">
                        An introduction to how technology can strengthen governance,
                        transparency and citizen participation in Nigeria.
                    </p>

                    <p
                    className="mt-4 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-center text-[10px] font-medium text-gray-400"
                    aria-label="PDF resource not yet available"
                    >
                     PDF resource coming soon
                    </p>
                    </div>
                </article>

                {/* RESOURCE 3 */}
                <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex h-36 items-center justify-center bg-[#123D68] p-5">
                    <div className="max-w-[220px] text-center text-white">
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-[#9BC9B0]">
                        Digital Democracy
                        </p>
                        <p className="mt-3 text-lg font-bold leading-tight">
                        How Nigerians Can Shape Change Online
                        </p>
                    </div>
                    </div>

                    <div className="p-4">
                    <span className="text-[8px] font-semibold uppercase text-[#0B3C5D]">
                        PDF Guide
                    </span>

                    <h3 className="mt-2 text-sm font-bold leading-snug text-[#20272B]">
                        Digital Democracy: How Nigerians Can Shape Change Online
                    </h3>

                    <p className="mt-2 text-[10px] leading-5 text-gray-500">
                        Explore how digital platforms can support civic awareness,
                        public dialogue and democratic participation.
                    </p>

                    <p
                    className="mt-4 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-center text-[10px] font-medium text-gray-400"
                    aria-label="PDF resource not yet available"
                    >
                        PDF resource coming soon
                    </p>
                    </div>
                </article>

                </div>
            </div>
        </section>




    </main>
  );
}

export default VoterEducation;
