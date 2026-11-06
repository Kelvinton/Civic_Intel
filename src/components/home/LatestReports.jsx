
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

import {
  revealVariants,
  staggerContainer,
  useMotionSettings,
} from "../../animation.js";

import { getMedia } from "../../api/media.js";

import Category1 from "../../assets/latest report/category1.png";
import Category2 from "../../assets/latest report/category2.png";
import Category3 from "../../assets/latest report/category3.png";

// Existing static reports.
// These remain available as fallbacks.
const fallbackReports = [
  {
    id: "fallback-health",
    category: "HEALTH",
    title: "Understanding Maternal Health Across Nigerian States",
    description:
      "Explore maternal health coverage and the differences in access to care across states.",
    date: "September 2026",
    image: Category3,
    imageAlt: "Healthcare professional working in a clinical setting",
    mediaId: null,
  },
  {
    id: "fallback-education",
    category: "EDUCATION",
    title: "Primary School Completion: A State-by-State View",
    description:
      "Examine education completion indicators and identify differences between states.",
    date: "August 2026",
    image: Category2,
    imageAlt: "Students participating in a classroom lesson",
    mediaId: null,
  },
  {
    id: "fallback-finance",
    category: "PUBLIC FINANCE",
    title: "How States Allocate Health and Education Budgets",
    description:
      "Review public spending indicators and how budget allocations vary across states.",
    date: "August 2026",
    image: Category1,
    imageAlt: "Financial documents and calculations on a desk",
    mediaId: null,
  },
];

// Format API publication dates.
function formatDate(date) {
  if (!date) return "Date not available";

  return new Date(date).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });
}

// Convert API reports into the format used by the cards.
function formatMediaReport(report) {
  return {
    id: report.id,
    mediaId: report.id,
    category: report.category?.toUpperCase() || "CIVICINTEL",
    title: report.title,
    description: report.source
      ? `Source: ${report.source}`
      : "Explore this latest CivicIntel release.",
    date: formatDate(report.published_on),
    image: report.image_url || Category1,
    imageAlt: report.title,
  };
}

function LatestReports() {
  const motionSettings = useMotionSettings();
  const navigate = useNavigate();

  const [publishedReports, setPublishedReports] = useState([]);

  // Fetch the latest published media reports.
  useEffect(() => {
    let isMounted = true;

    async function loadLatestReports() {
      try {
        const response = await getMedia({
          limit: 3,
          offset: 0,
        });

        if (!isMounted) return;

        const items = Array.isArray(response.items)
          ? response.items
          : [];

        const sortedReports = [...items].sort(
          (a, b) =>
            new Date(b.published_on || 0) -
            new Date(a.published_on || 0)
        );

        setPublishedReports(
          sortedReports.map(formatMediaReport)
        );
      } catch (error) {
        console.error(
          "Failed to load homepage media reports:",
          error
        );
      }
    }

    loadLatestReports();

    return () => {
      isMounted = false;
    };
  }, []);

  // Published reports take priority.
  // Static reports fill any remaining spaces.
  const reports = [
    ...publishedReports,
    ...fallbackReports.slice(
      0,
      Math.max(0, 3 - publishedReports.length)
    ),
  ];

  return (
    <section
      id="latest-reports"
      className="bg-gray-200 px-5 py-12 sm:px-8 sm:py-16 lg:px-20"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <motion.div
          variants={revealVariants}
          {...motionSettings}
          className="flex flex-wrap items-center justify-between gap-4"
        >
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

            <h2 className="text-lg font-bold tracking-wide sm:text-xl">
              LATEST REPORTS
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate("/media")}
            className="mb-6 inline-flex items-center justify-center text-xs font-semibold text-[#1F7A3F] transition-colors hover:underline"
          >
            View all releases

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12h15m0 0-6.75-6.75M19.5 12l-6.75 6.75"
              />
            </svg>
          </button>
        </motion.div>

        {/* Report cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={motionSettings.viewport}
          className="mt-7 grid grid-cols-1 gap-5 px-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {reports.map((report) => {
            const destination = report.mediaId
              ? `/media/${report.mediaId}`
              : "/media";

            return (
              <motion.article
                key={report.id}
                variants={revealVariants}
                className="group flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-300 bg-white text-[#171717] shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl active:scale-[0.99] focus-within:border-[#1F7A3F] motion-reduce:transform-none motion-reduce:transition-none"
              >
                {/* Report image */}
                <Link
                  to={destination}
                  aria-label={`Read ${report.title}`}
                  className="block overflow-hidden focus-visible:outline-2 focus-visible:outline-[#1F7A3F]"
                >
                  <img
                    src={report.image}
                    alt={report.imageAlt}
                    loading="lazy"
                    className="h-48 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-active:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none sm:h-52"
                  />
                </Link>

                {/* Card content */}
                <div className="flex flex-1 flex-col p-5 text-black">
                  <p className="text-[10px] font-semibold tracking-widest transition-colors duration-300 group-hover:text-[#1F7A3F]">
                    {report.category}
                  </p>

                  <h3 className="mt-3 text-base font-semibold leading-6">
                    <Link
                      to={destination}
                      className="transition-colors duration-300 hover:text-[#1F7A3F] active:text-[#1F7A3F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#65C98A]"
                    >
                      {report.title}
                    </Link>
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-black">
                    {report.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                    <span className="text-xs text-gray-600">
                      {report.date}
                    </span>

                    <span
                      aria-hidden="true"
                      className="inline-flex shrink-0 -translate-x-1 items-center text-xs font-semibold text-[#1F7A3F] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none"
                    >
                      Read <span className="ml-1">↗</span>
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default LatestReports;
