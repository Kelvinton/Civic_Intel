
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import OperatingRoom from "../../assets/category/operating.room.png";
import StudentsInClass from "../../assets/category/students.inclass.png";

import {
  revealVariants,
  useMotionSettings,
} from "../../animation.js";

import { getPublishedRecords } from "../../api/publishedData.js";
import { getStates } from "../../api/referenceData.js";

const imageSlideRight = {
  hidden: {
    opacity: 0,
    x: 60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const imageSlideLeft = {
  hidden: {
    opacity: 0,
    x: -60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// These are the three indicators displayed in each category.
const categoryConfig = [
  {
    id: "health",
    sector: "health",
    title: "Health Indicators",
    description:
      "Explore coverage, outcomes, and system indicators drawn from verified national surveys and administrative sources, filterable by state and year.",
    image: OperatingRoom,
    imageAlt: "Healthcare professionals in a hospital operating room",
    link: "/health",
    indicators: [
      {
        key: "anc4_pct",
        label: "Antenatal Care 4+ visits",
      },
      {
        key: "hiv_prevalence_pct",
        label: "HIV prevalence among adults 15–49",
      },
      {
        key: "maternal_mortality_ratio",
        label: "Maternal mortality ratio",
      },
      {
        key: "under_five_mortality",
        label: "Under Five Mortality ratio",
      },

    
    ],
  },
  {
    id: "education",
    sector: "education",
    title: "Education Indicators",
    description:
      "Explore enrolment, completion, learning outcomes, teachers, examinations, infrastructure, and financing, filterable by state and year, with every figure traceable to its source.",
    image: StudentsInClass,
    imageAlt: "Schoolchildren participating in a classroom lesson",
    link: "/education",
    indicators: [
      {
        key: "primary_net_enrolment_pct",
        label: "Primary net enrolment rate",
      },
      {
        key: "primary_completion_pct",
        label: "Primary completion rate",
      },
      {
        key: "adult_literacy_pct",
        label: "Adult literacy rate",
      },
      {
        key: "primary_pupil_teacher_ratio",
        label: "Primary pupil-teacher ratio",
      },
    ],
  },
];

// Fetch every page of published records for a sector.
async function fetchSectorRecords(sector) {
  const allRecords = [];
  const limit = 100;
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const response = await getPublishedRecords({
      sector,
      limit,
      offset,
    });

    if (!response || !Array.isArray(response.items)) {
      throw new Error(
        `The ${sector} records response was not in the expected format.`
      );
    }

    allRecords.push(...response.items);

    total = Number(response.total ?? allRecords.length);
    offset += response.items.length;

    if (
      response.items.length === 0 ||
      response.items.length < limit
    ) {
      break;
    }
  }

  return allRecords;
}

// Get the latest available Lagos record for each selected indicator.
function getCategoryMetrics(records, indicators, selectedState) {
  return indicators.map((indicator) => {
    const matchingRecords = records
      .filter(
        (record) =>
          record.state?.toLowerCase() === selectedState.toLowerCase() &&
          record.indicator_key === indicator.key &&
          record.value !== null &&
          record.value !== undefined
      )
      .sort((a, b) => Number(b.year) - Number(a.year));

    const record = matchingRecords[0];

    return {
      ...indicator,
      record: record ?? null,
    };
  });
}

function getRandomItem(items) {
  if (!items.length) return null;

  const randomIndex = Math.floor(
    Math.random() * items.length
  );

  return items[randomIndex];
}

function formatMetricValue(record) {
  if (!record) return "Not available";

  const value = Number(record.value);

  if (!Number.isFinite(value)) {
    return String(record.value);
  }

  const formattedValue = new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 2,
  }).format(value);

  return record.unit === "%"
    ? `${formattedValue}%`
    : `${formattedValue} ${record.unit || ""}`.trim();
}

function CategoryRow({
  category,
  reverse = false,
  metrics,
  loading,
  error,
  selectedState,
  availableStates,
  handleChangeState,
}) {
  const motionSettings = useMotionSettings();

  // Health enters from the right; Education enters from the left.
  const imageVariants = reverse ? imageSlideLeft : imageSlideRight;

  return (
    <article
      id={category.id}
      className="grid grid-cols-1 items-center gap-8 py-10 sm:gap-10 sm:py-14 lg:grid-cols-2 lg:gap-16 lg:py-16"
    >
      {/* Image animation */}
      <motion.div
        {...motionSettings}
        variants={imageVariants}
        className={`min-w-0 ${reverse ? "lg:order-1" : "lg:order-2"}`}
      >
        <img
          src={category.image}
          alt={category.imageAlt}
          loading="lazy"
          className={`h-72 w-full object-cover sm:h-96 ${
            reverse
              ? "rounded-bl-[5rem] rounded-tr-[5rem] lg:h-102.5"
              : "rounded-br-[5rem] rounded-tl-[5rem] lg:h-108.5"
          }`}
        />
      </motion.div>

      {/* Text animation */}
      <motion.div
        {...motionSettings}
        variants={revealVariants}
        className={`min-w-0 ${reverse ? "lg:order-2" : "lg:order-1"}`}
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#1F7A3F]">
          {category.title}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3 justify-between">
          <motion.div
            {...motionSettings}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.7, 1, 0.7],
              scale: [1, 1.08, 1],
            }}
            transition={{
              opacity: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
              scale: {
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[#E8F1EB] px-3 py-1.5 justify-between"
          >
            <span className="h-2 w-2 rounded-full bg-[#1F7A3F]" />

            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A3F]">
              {selectedState}
            </span>
          </motion.div>

          <motion.button
            {...motionSettings}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.7, 1, 0.7],
              scale: [1, 1.08, 1],
            }}
            transition={{
              opacity: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
              scale: {
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            type="button"
            onClick={handleChangeState}
            disabled={availableStates.length <= 1}
            className="rounded-full border border-[#1F7A3F] px-3 py-1.5 text-xs font-semibold text-[#1F7A3F] transition hover:bg-[#E8F1EB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Change State
          </motion.button>
        </div>

        {/* Metrics animate one after another */}
        <div className="mt-7 grid grid-cols-2 gap-5">
          {loading ? (
            <p className="col-span-2 text-sm text-gray-500">
              Loading published indicators...
            </p>
          ) : error ? (
            <p className="col-span-2 text-sm text-red-600">
              Could not load indicators. Please try again later.
            </p>
          ) : (
            metrics.map((metric) => (
              <div
                key={metric.key}
                className="min-w-0"
              >
                <p className="text-lg font-bold text-black sm:text-xl">
                  {formatMetricValue(metric.record)}
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {metric.label}
                </p>

                <p className="mt-2 text-[10px] leading-4 text-gray-500">
                  {metric.record
                    ? `${selectedState} • ${metric.record.year}`
                    : `No published ${selectedState} record`}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-center text-xs text-gray-500">
            Showing the latest available published figures for {selectedState} State.
          </p>

          <Link
            to={category.link}
            className="inline-flex items-center gap-2  px-5 py-2.5 text-sm font-semibold  transition-colors duration-300 hover:text-[#1F7A3F] text-black"
          >
            See More
            
          </Link>
        </div>
      </motion.div>
    </article>
  );
}

function Categories() {
  const motionSettings = useMotionSettings();
  const [selectedState, setSelectedState] = useState("");
  const [availableStates, setAvailableStates] = useState([]);
  const [publishedRecords, setPublishedRecords] = useState({
    health: [],
    education: [],
  });

  const [recordsLoaded, setRecordsLoaded] = useState(false);

  function handleChangeState() {
    const otherStates = availableStates.filter(
      (state) => state.name !== selectedState
    );

    const nextState = getRandomItem(otherStates);

    if (!nextState) return;

    setSelectedState(nextState.name);
  }
  
  useEffect(() => {
    let isMounted = true;

    async function selectRandomState() {
      try {
        const response = await getStates();

        if (!Array.isArray(response) || response.length === 0) {
          throw new Error("No states were returned by the API.");
        }

        const randomIndex = Math.floor(
          Math.random() * response.length
        );

        if (isMounted) {
          setAvailableStates(response);
          setSelectedState(response[randomIndex].name);
        }
      } catch (error) {
        console.error("Could not select a state:", error);
      }
    }

    selectRandomState();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryData = {
    health:
      selectedState && recordsLoaded
        ? getCategoryMetrics(
            publishedRecords.health,
            categoryConfig[0].indicators,
            selectedState
          )
        : [],

    education:
      selectedState && recordsLoaded
        ? getCategoryMetrics(
            publishedRecords.education,
            categoryConfig[1].indicators,
            selectedState
          )
        : [],
  };

  const [loading, setLoading] = useState({
    health: true,
    education: true,
  });

  const [errors, setErrors] = useState({
    health: "",
    education: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadPublishedRecords() {
      try {
        const [healthRecords, educationRecords] = await Promise.all([
          fetchSectorRecords("health"),
          fetchSectorRecords("education"),
        ]);

        setPublishedRecords({
          health: healthRecords,
          education: educationRecords,
        });

        setRecordsLoaded(true);

        setLoading({
          health: false,
          education: false,
        });
      } catch (error) {
        if (isMounted) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Could not load published records.";

          setErrors({
            health: errorMessage,
            education: errorMessage,
          });

          setLoading({
            health: false,
            education: false,
          });
        }
      }
    }

    loadPublishedRecords();

    return () => {
      isMounted = false;
    };
  }, []);

 

  return (
    <section id="categories" className="bg-white text-black">
      {/* Section heading */}
      <div className="bg-[#dce3e6] pb-4 pt-12">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-5 sm:px-8 lg:px-4">
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
            THE CATEGORIES
          </motion.h2>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-22">
        {/* Health: text left, image slides in from the right */}
        <CategoryRow
          category={categoryConfig[0]}
          metrics={categoryData.health}
          loading={loading.health}
          error={errors.health}
          selectedState={selectedState}
          availableStates={availableStates}
          handleChangeState={handleChangeState}
        />

        {/* Education: image left, text right, image slides in from the left */}
        <CategoryRow
          category={categoryConfig[1]}
          reverse
          metrics={categoryData.education}
          loading={loading.education}
          error={errors.education}
          selectedState={selectedState}
          availableStates={availableStates}
          handleChangeState={handleChangeState}
        />
      </div>
    </section>
  );
}

export default Categories;
