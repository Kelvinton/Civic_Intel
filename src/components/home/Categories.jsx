
import { motion } from "framer-motion";

import OperatingRoom from "../../assets/category/operating.room.png";
import StudentsInClass from "../../assets/category/students.inclass.png";

import {
  revealVariants,
  staggerContainer,
  useMotionSettings,
} from "../../animation.js";

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

const categories = [
  {
    id: "health",
    title: "Health Indicators",
    description:
      "Explore coverage, outcomes, and system indicators drawn from verified national surveys and administrative sources, filterable by state and year.",
    image: OperatingRoom,
    imageAlt: "Healthcare professionals in a hospital operating room",
    metrics: [
      {
        value: "67.4%",
        label: "ANC 4+ Coverage (national)",
        trend: "2.1 pts vs prior year",
        positive: true,
      },
      {
        value: "512",
        label: "Maternal mortality ratio/100k",
        trend: "Improving trend",
        positive: false,
      },
    ],
    source: "NDHS • 2023 • Verified Aug 2026",
  },
  {
    id: "education",
    title: "Education Indicators",
    description:
      "Explore enrolment, completion, learning outcomes, teachers, examinations, infrastructure, and financing — filterable by state and year, with every figure traceable to its source.",
    image: StudentsInClass,
    imageAlt: "Schoolchildren participating in a classroom lesson",
    metrics: [
      {
        value: "68.2%",
        label: "Primary completion rate",
        trend: "1.4 pts vs prior year",
        positive: true,
      },
      {
        value: "10.5M",
        label: "Out-of-school children",
        trend: "Latest estimate",
        positive: null,
      },
    ],
    source: "UNICEF/EMIS • 2022 • Verified Aug 2026",
  },
];

function CategoryRow({ category, reverse = false }) {
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

        <p className="max-w-xl text-sm leading-6 text-gray-700 sm:text-base sm:leading-7">
          {category.description}
        </p>

        {/* Metrics animate one after another */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="mt-7 grid grid-cols-2 gap-5"
        >
          {category.metrics.map((metric) => (
            <motion.div
              key={metric.label}
              variants={revealVariants}
              className="min-w-0"
            >
              <p className="text-lg font-bold text-black sm:text-xl">
                {metric.value}
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                {metric.label}
              </p>

              <div className="mt-2 flex items-center gap-1">
                {metric.positive === true && (
                  <div className="h-2 w-2 bg-[#1F7A3F] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
                )}

                {metric.positive === false && (
                  <div className="h-2 w-2 bg-red-600 [clip-path:polygon(50%_100%,0%_0%,100%_0%)]" />
                )}

                <p
                  className={`text-[10px] leading-4 ${
                    metric.positive === true
                      ? "text-[#1F7A3F]"
                      : metric.positive === false
                        ? "text-red-600"
                        : "text-gray-500"
                  }`}
                >
                  {metric.trend}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-8 text-center text-sm text-gray-500 sm:text-center">
          {category.source}
        </p>
      </motion.div>
    </article>
  );
}

function Categories() {
  const motionSettings = useMotionSettings();

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
        <CategoryRow category={categories[0]} />

        {/* Education: image left, text right, image slides in from the left */}
        <CategoryRow category={categories[1]} reverse />
      </div>
    </section>
  );
}

export default Categories;
