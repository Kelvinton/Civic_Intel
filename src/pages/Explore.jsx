
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useAuth } from "../context/AuthContext.jsx";
import { getCompareOptions } from "../api/referenceData.js";

import ExploreHeroPic from "../assets/Explore.hero.png";

import {
  revealVariants,
  useMotionSettings,
} from "../animation.js";

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const domains = ["Health", "Education"];

const steps = [
  "Domain",
  "Indicator",
  "States",
  "Years",
  "Review",
];

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------

// Handles common API response wrappers.
function unwrapResponse(response) {
  return (
    response?.data?.data ??
    response?.data ??
    response
  );
}

// Get a usable year value from the backend.
// Supports both simple years and objects containing year/value.
function getYearValue(item) {
  if (typeof item === "object" && item !== null) {
    return item.year ?? item.value ?? "";
  }

  return item;
}

// --------------------------------------------------
// REUSABLE UI COMPONENTS
// --------------------------------------------------

function SectionCard({ children, className = "" }) {
  return (
    <section
      className={`rounded-xl bg-[#FFFAEB] p-4 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeading({ children }) {
  return (
    <h2 className="text-base font-bold text-[#0B3C5D] sm:text-lg">
      {children}
    </h2>
  );
}

function SectionDescription({ children }) {
  return (
    <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
      {children}
    </p>
  );
}

// --------------------------------------------------
// EXPLORE HERO
// --------------------------------------------------

function ExploreHero() {
  const motionSettings = useMotionSettings();

  const heroImageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.82,
      y: 35,
    },

    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.85,
        delay: 0.15,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="bg-[#062638] pt-18 text-white sm:pt-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 pb-16 pt-8 sm:grid-cols-2 sm:px-8 md:pb-24 lg:px-12 lg:py-12">
        <motion.div
          variants={revealVariants}
          {...motionSettings}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-white/80">
            Civic Analytics Engine
          </p>

          <h1 className="mt-3 max-w-lg text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Explore &amp;
            <br />
            Analyze Data
          </h1>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
            Compare Health or Education indicators across states
            and years.
          </p>
        </motion.div>

        <motion.div
          className="relative z-10 h-56 overflow-hidden rounded-xl bg-[#0B3C5D] shadow-2xl shadow-black/25 transition-transform duration-500 hover:-translate-y-1 sm:h-72 lg:h-80"
          variants={heroImageVariants}
          {...motionSettings}
        >
          <img
            src={ExploreHeroPic}
            alt="Organised public records and documents"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </motion.div>
      </div>
    </section>
  );
}

// --------------------------------------------------
// STEP PROGRESS
// --------------------------------------------------

function StepProgress({ activeStep, onStepClick }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-3 pt-7 sm:px-8 sm:pt-8">
      <div className="grid grid-cols-5">
        {steps.map((step, index) => {
          const active = index === activeStep;
          const completed = index < activeStep;

          return (
            <div
              key={step}
              className="relative flex min-w-0 flex-col items-center"
            >
              {index < steps.length - 1 && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 70 24"
                  preserveAspectRatio="none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`pointer-events-none absolute left-1/2 top-1.5 z-0 h-6 w-full sm:top-3 ${
                    completed
                      ? "text-[#1F7A3F]"
                      : "text-slate-400"
                  }`}
                  aria-hidden="true"
                >
                  <path d="M0 12 H94" />
                  <path d="M86 5 L94 12 L86 19" />
                </svg>
              )}

              <button
                type="button"
                onClick={() => onStepClick(index)}
                disabled={index > activeStep}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${index + 1}: ${step}`}
                className="relative z-10 flex flex-col items-center disabled:cursor-not-allowed"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition sm:h-12 sm:w-12 sm:text-sm ${
                    active || completed
                      ? "border-[#1F7A3F] bg-[#1F7A3F] text-white"
                      : "border-slate-400 bg-white text-slate-500"
                  }`}
                >
                  {completed ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>

                <span
                  className={`mt-2 whitespace-nowrap text-center text-[9px] sm:text-xs ${
                    active
                      ? "font-bold text-[#1F7A3F]"
                      : completed
                        ? "font-medium text-[#1F7A3F]"
                        : "text-slate-600"
                  }`}
                >
                  {step}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --------------------------------------------------
// DOMAIN OPTION
// --------------------------------------------------

function DomainOption({ domain, selected, onClick }) {
  const health = domain === "Health";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-w-0 rounded-xl border p-4 text-left transition sm:p-5 ${
        selected
          ? "border-[#1F7A3F] bg-white ring-2 ring-[#1F7A3F]/20"
          : "border-slate-200 bg-white/50 hover:border-[#1F7A3F] hover:bg-white"
      }`}
    >
      <span
        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-medium uppercase ${
          health
            ? "bg-[#BFE0C7] text-[#1F7A3F]"
            : "bg-[#C6D6E0] text-[#0B3C5D]"
        }`}
      >
        {domain}
      </span>

      <span className="mt-3 block text-sm font-semibold text-[#0B3C5D] sm:text-base">
        {domain} Data
      </span>

      <span className="mt-2 block text-xs leading-relaxed text-slate-600 sm:text-sm">
        {health
          ? "Coverage, outcomes, systems and financing indicators."
          : "Enrolment, completion, learning outcomes and exams."}
      </span>

      {selected && (
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#1F7A3F]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>

          Selected
        </span>
      )}
    </button>
  );
}

// --------------------------------------------------
// MAIN EXPLORE PAGE
// --------------------------------------------------

function Explore() {
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoggedIn, loading } = useAuth();
  const motionSettings = useMotionSettings();

  // Restore selections after returning from login.
  const restoredDraft = location.state?.exploreDraft;

  // ------------------------------------------------
  // BACKEND DATA
  // ------------------------------------------------

  const [states, setStates] = useState([]);
  const [indicators, setIndicators] = useState([]);

  const [statesLoading, setStatesLoading] = useState(true);
  const [statesError, setStatesError] = useState("");

  // Fetch states and indicators from the comparison options endpoint.
  useEffect(() => {
    let isMounted = true;

    async function loadCompareOptions() {
      try {
       

        const response = await getCompareOptions();
        const data = unwrapResponse(response);


        if (!Array.isArray(data?.states)) {
          throw new Error(
            "The backend did not return a valid states list."
          );
        }

        if (!Array.isArray(data?.indicators)) {
          throw new Error(
            "The backend did not return a valid indicators list."
          );
        }

        if (isMounted) {
          setStates(data.states);
          setIndicators(data.indicators);
        }
      } catch (error) {
        if (isMounted) {
          setStatesError(
            error.message ||
              "Could not load comparison options. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setStatesLoading(false);
        }
      }
    }

    loadCompareOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Retry loading backend comparison options.
  const retryLoadOptions = async () => {
    try {
      setStatesLoading(true);
      setStatesError("");

      const response = await getCompareOptions();
      const data = unwrapResponse(response);

      if (!Array.isArray(data?.states)) {
        throw new Error("The backend did not return a valid states list.");
      }

      if (!Array.isArray(data?.indicators)) {
        throw new Error("The backend did not return a valid indicators list.");
      }

      setStates(data.states);
      setIndicators(data.indicators);
    } catch (error) {
      setStatesError(
        error.message || "Could not load comparison options."
      );
    } finally {
      setStatesLoading(false);
    }
  };

  // ------------------------------------------------
  // USER SELECTIONS
  // ------------------------------------------------

  const initialDomain =
    restoredDraft?.domain === "Education"
      ? "Education"
      : "Health";

  const [domain, setDomain] = useState(initialDomain);

  const [indicator, setIndicator] = useState(
    restoredDraft?.indicatorKey ||
      restoredDraft?.indicator ||
      ""
  );

  const [rawSelectedStates, setRawSelectedStates] = useState(() => {
    const restoredStates = restoredDraft?.selectedStates;

    return Array.isArray(restoredStates)
      ? [...new Set(restoredStates)]
      : [];
  });

  const [fromYear, setFromYear] = useState(
    String(restoredDraft?.fromYear || "")
  );

  const [toYear, setToYear] = useState(
    String(restoredDraft?.toYear || "")
  );

  const [activeStep, setActiveStep] = useState(0);
  const [comparisonMessage, setComparisonMessage] = useState("");

 // ------------------------------------------------
// FILTER BACKEND INDICATORS BY DOMAIN
// ------------------------------------------------

const availableIndicators = useMemo(() => {
  return indicators.filter((item) => {
    const classification = String(
      item.sector ||
        item.domain ||
        item.category ||
        ""
    ).toLowerCase();

    return classification.includes(domain.toLowerCase());
  });
}, [indicators, domain]);

// Use the selected indicator if it is valid.
// Otherwise, automatically use the first available indicator.
const selectedIndicator =
  availableIndicators.find(
    (item) => item.key === indicator
  ) || availableIndicators[0] || null;

  // ------------------------------------------------
  // AVAILABLE YEARS
  // ------------------------------------------------

  const years = useMemo(() => {
    const indicatorYears = selectedIndicator?.years;

    if (!Array.isArray(indicatorYears)) {
      return [];
    }

    return [
      ...new Set(
        indicatorYears
          .map(getYearValue)
          .filter(
            (year) =>
              year !== undefined &&
              year !== null &&
              String(year).trim() !== ""
          )
          .map(String)
      ),
    ].sort((a, b) => Number(a) - Number(b));
  }, [selectedIndicator]);

  // Derive valid year selections without updating state in an effect.
  const effectiveFromYear = years.includes(fromYear)
    ? fromYear
    : years[0] || "";

  const effectiveToYear = years.includes(toYear)
    ? toYear
    : years[years.length - 1] || "";

  

  // ------------------------------------------------
  // VALID STATES
  // ------------------------------------------------

  const selectedStates = useMemo(() => {
    if (statesLoading || statesError) {
      return rawSelectedStates;
    }

    const validStateNames = new Set(
      states.map((state) => state.name)
    );

    return rawSelectedStates.filter((name) =>
      validStateNames.has(name)
    );
  }, [
    rawSelectedStates,
    states,
    statesLoading,
    statesError,
  ]);

  // ------------------------------------------------
  // SELECTION HANDLERS
  // ------------------------------------------------

  const toggleState = (stateName) => {
    setComparisonMessage("");

    setRawSelectedStates((previous) => {
      const validSelections =
        statesLoading || statesError
          ? previous
          : previous.filter((name) =>
              states.some((state) => state.name === name)
            );

      return validSelections.includes(stateName)
        ? validSelections.filter(
            (name) => name !== stateName
          )
        : [...validSelections, stateName];
    });
  };

  const changeDomain = (nextDomain) => {
    setDomain(nextDomain);
    setIndicator("");
    setComparisonMessage("");
  };

  const handleStepClick = (index) => {
    if (index <= activeStep) {
      setActiveStep(index);
      setComparisonMessage("");
    }
  };

  // ------------------------------------------------
  // STEP VALIDATION
  // ------------------------------------------------

  const handleNextStep = () => {
    setComparisonMessage("");

    // Validate indicator selection.
    if (activeStep === 1 && !selectedIndicator?.key) {
      setComparisonMessage(
        "No indicator is currently available for this domain."
      );
      return;
    }

    // Validate state selection.
    if (activeStep === 2 && selectedStates.length < 2) {
      setComparisonMessage(
        "Please select at least two states to compare."
      );
      return;
    }

    // Validate year range.
    if (
      activeStep === 3 &&
      effectiveFromYear &&
      effectiveToYear &&
      Number(effectiveFromYear) > Number(effectiveToYear)
    ) {
      setComparisonMessage(
        "The starting year must not be later than the ending year."
      );
      return;
    }

    if (
      activeStep === 3 &&
      Boolean(effectiveFromYear) !== Boolean(effectiveToYear)
    ) {
      setComparisonMessage(
        "Please select both years or leave both blank."
      );
      return;
    }

    setActiveStep((current) =>
      Math.min(current + 1, 4)
    );
  };

  const handlePreviousStep = () => {
    setComparisonMessage("");

    setActiveStep((current) =>
      Math.max(current - 1, 0)
    );
  };

  // ------------------------------------------------
  // GENERATE COMPARISON
  // ------------------------------------------------

  const handleGenerateComparison = () => {
    setComparisonMessage("");

    if (!selectedIndicator?.key) {
      setComparisonMessage(
        "Please select an available indicator before generating your comparison."
      );

      setActiveStep(1);
      return;
    }

    if (selectedStates.length < 2) {
      setComparisonMessage(
        "Please select at least two states to compare."
      );

      setActiveStep(2);
      return;
    }

    if (
      effectiveFromYear &&
      effectiveToYear &&
      Number(effectiveFromYear) > Number(effectiveToYear)
    ) {
      setComparisonMessage(
        "The starting year must not be later than the ending year."
      );

      setActiveStep(3);
      return;
    }

    if (Boolean(effectiveFromYear) !== Boolean(effectiveToYear)) {
      setComparisonMessage(
        "Please select both years or leave both blank."
      );

      setActiveStep(3);
      return;
    }

    if (loading) {
      setComparisonMessage(
        "Checking your sign-in status. Please try again shortly."
      );
      return;
    }

    // This object is passed to CompareResults.jsx.
    // indicator contains the backend key, not its display name.
    const comparison = {
      domain,

      indicator: selectedIndicator.key,
      indicatorKey: selectedIndicator.key,
      indicatorName: selectedIndicator.name,

      unit: selectedIndicator.unit || "",
      category: selectedIndicator.category || "",

      selectedStates,

      fromYear: effectiveFromYear || undefined,
      toYear: effectiveToYear || undefined,
    };

    // Require authentication before generating results.
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: {
            pathname: "/explore",
          },

          exploreDraft: comparison,

          message:
            "Log in to generate your comparison. Your selections will be kept.",
        },
      });

      return;
    }

    // Navigate to the shared comparison results page.
    navigate("/compare-results", {
      state: {
        comparison,
      },
    });
  };

  // ------------------------------------------------
  // PAGE UI
  // ------------------------------------------------

  return (
    <div className="min-h-screen bg-[#B4C6D0]">
      <ExploreHero />

      <motion.div
        variants={revealVariants}
        {...motionSettings}
      >
        <StepProgress
          activeStep={activeStep}
          onStepClick={handleStepClick}
        />
      </motion.div>

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-7 sm:px-8 sm:pt-9">
        <motion.div
          variants={revealVariants}
          {...motionSettings}
        >
          <SectionCard className="min-h-85 sm:min-h-97.5">

            {/* -------------------------------------- */}
            {/* STEP 1: CHOOSE DOMAIN */}
            {/* -------------------------------------- */}

            {activeStep === 0 && (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#1F7A3F]">
                  Step 1 of 5
                </p>

                <SectionHeading>
                  Choose a domain
                </SectionHeading>

                <SectionDescription>
                  What type of public data would you like to explore?
                  Choose Health or Education to see the available indicators.
                </SectionDescription>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {domains.map((item) => (
                    <DomainOption
                      key={item}
                      domain={item}
                      selected={domain === item}
                      onClick={() => changeDomain(item)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* -------------------------------------- */}
            {/* STEP 2: SELECT INDICATOR */}
            {/* -------------------------------------- */}

            {activeStep === 1 && (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#1F7A3F]">
                  Step 2 of 5
                </p>

                <SectionHeading>
                  Select an indicator
                </SectionHeading>

                <SectionDescription>
                  Choose the specific {domain.toLowerCase()} indicator
                  you want to compare across states.
                </SectionDescription>

                {statesLoading ? (
                  <p className="mt-5 text-sm text-slate-600">
                    Loading indicators from CivicIntel...
                  </p>
                ) : statesError ? (
                  <p className="mt-5 text-sm text-red-700">
                    {statesError}
                  </p>
                ) : availableIndicators.length === 0 ? (
                  <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-900">
                      No {domain} indicators are currently available.
                    </p>

                    
                  </div>
                ) : (
                  <>
                    <label
                      htmlFor="indicator"
                      className="mt-6 block text-sm font-medium text-[#0B3C5D]"
                    >
                      Available indicators
                    </label>

                    <select
                      id="indicator"
                      value={indicator}
                      onChange={(event) => {
                        setIndicator(event.target.value);
                        setComparisonMessage("");
                      }}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-[#0B3C5D] focus:ring-2 focus:ring-[#0B3C5D]/10"
                    >
                      {availableIndicators.map((item) => (
                        <option
                          key={item.key}
                          value={item.key}
                        >
                          {item.name}
                        </option>
                      ))}
                    </select>

                    <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
                      <p className="text-xs text-slate-500">
                        Selected indicator
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#0B3C5D]">
                        {selectedIndicator?.name || "No indicator selected"}
                      </p>

                      {selectedIndicator?.unit && (
                        <p className="mt-1 text-xs text-slate-500">
                          Unit: {selectedIndicator.unit}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {/* -------------------------------------- */}
            {/* STEP 3: SELECT STATES */}
            {/* -------------------------------------- */}

            {activeStep === 2 && (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#1F7A3F]">
                  Step 3 of 5
                </p>

                <SectionHeading>
                  Select states to compare
                </SectionHeading>

                <SectionDescription>
                  Choose at least two Nigerian states. You can select
                  additional states to compare a wider range of locations.
                </SectionDescription>

                {statesLoading ? (
                  <p className="mt-5 text-sm text-slate-600" role="status">
                    Loading states from CivicIntel...
                  </p>
                ) : statesError ? (
                  <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
                    <p
                      className="text-sm text-red-700"
                      role="alert"
                    >
                      {statesError}
                    </p>

                    <button
                      type="button"
                      onClick={retryLoadOptions}
                      className="mt-3 text-sm font-semibold text-[#1F7A3F] underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : states.length === 0 ? (
                  <p className="mt-5 text-sm text-slate-600">
                    No states were returned by the backend.
                  </p>
                ) : (
                  <>
                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                      {states.map((state) => {
                        const selected = selectedStates.includes(
                          state.name
                        );

                        return (
                          <button
                            type="button"
                            key={state.id ?? state.name}
                            onClick={() => toggleState(state.name)}
                            aria-pressed={selected}
                            className={`min-w-0 rounded-lg border px-2 py-3 text-xs transition sm:text-sm ${
                              selected
                                ? "border-[#1F7A3F] bg-[#1F7A3F] font-semibold text-white"
                                : "border-slate-300 bg-white text-slate-600 hover:border-[#1F7A3F] hover:text-[#1F7A3F]"
                            }`}
                          >
                            {state.name}
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-4 text-xs text-slate-600">
                      <span className="font-semibold text-[#0B3C5D]">
                        {selectedStates.length}
                      </span>{" "}
                      state{selectedStates.length === 1 ? "" : "s"} selected

                      {selectedStates.length < 2
                        ? " — select at least two to continue."
                        : "."}
                    </p>
                  </>
                )}
              </>
            )}

            {/* -------------------------------------- */}
            {/* STEP 4: SELECT YEARS */}
            {/* -------------------------------------- */}

            {activeStep === 3 && (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#1F7A3F]">
                  Step 4 of 5
                </p>

                <SectionHeading>
                  Choose your year range
                </SectionHeading>

                <SectionDescription>
                  Select the starting and ending years for your{" "}
                  {selectedIndicator?.name?.toLowerCase() || "indicator"}{" "}
                  comparison.
                </SectionDescription>

                {years.length > 0 ? (
                  <>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="fromYear"
                          className="block text-sm font-medium text-[#0B3C5D]"
                        >
                          Starting year
                        </label>

                        <select
                          id="fromYear"
                          value={effectiveFromYear}
                          onChange={(event) => {
                            setFromYear(event.target.value);
                            setComparisonMessage("");
                          }}
                          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-[#0B3C5D] focus:ring-2 focus:ring-[#0B3C5D]/10"
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="toYear"
                          className="block text-sm font-medium text-[#0B3C5D]"
                        >
                          Ending year
                        </label>

                        <select
                          id="toYear"
                          value={effectiveToYear}
                          onChange={(event) => {
                            setToYear(event.target.value);
                            setComparisonMessage("");
                          }}
                          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-[#0B3C5D] focus:ring-2 focus:ring-[#0B3C5D]/10"
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-5 rounded-lg bg-white p-4">
                      <p className="text-xs text-slate-500">
                        Selected period
                      </p>

                      <p className="mt-1 text-lg font-bold text-[#0B3C5D]">
                        {effectiveFromYear && effectiveToYear
                        ? `${effectiveFromYear} – ${effectiveToYear}`
                        : "All available years"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-900">
                      No year records are currently available.
                    </p>

                    <p className="mt-2 text-xs leading-relaxed text-amber-800">
                      You can continue without a year filter. The backend
                      will determine which available records to return.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* -------------------------------------- */}
            {/* STEP 5: REVIEW */}
            {/* -------------------------------------- */}

            {activeStep === 4 && (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#1F7A3F]">
                  Step 5 of 5
                </p>

                <SectionHeading>
                  Review your comparison
                </SectionHeading>

                <SectionDescription>
                  Confirm your selections before generating your comparison.
                </SectionDescription>

                <dl className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white px-4">
                  {[
                    ["Domain", domain],

                    [
                      "Indicator",
                      selectedIndicator?.name || "No indicator selected",
                    ],

                    [
                      "States",
                      selectedStates.length
                        ? selectedStates.join(", ")
                        : "None selected",
                    ],

                    [
                      "Year range",
                      effectiveFromYear && effectiveToYear
                        ? `${effectiveFromYear} – ${effectiveToYear}`
                        : "All available years",
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                    >
                      <dt className="text-xs font-medium text-[#0B3C5D] sm:text-sm">
                        {label}
                      </dt>

                      <dd className="text-sm text-slate-600 sm:max-w-[65%] sm:text-right">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-4 text-xs leading-relaxed text-slate-500">
                  Your comparison will use the domain, indicator,
                  states and years shown above.
                </p>
              </>
            )}

            {/* -------------------------------------- */}
            {/* VALIDATION MESSAGE */}
            {/* -------------------------------------- */}

            {comparisonMessage && (
              <p
                role="alert"
                className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 sm:text-sm"
              >
                {comparisonMessage}
              </p>
            )}

            {/* -------------------------------------- */}
            {/* NAVIGATION BUTTONS */}
            {/* -------------------------------------- */}

            <div className="mt-8 flex items-center justify-between gap-2 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={handlePreviousStep}
                disabled={activeStep === 0}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-2.5 text-xs font-semibold text-[#0B3C5D] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:px-5 sm:text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M19 12H5" />
                  <path d="m11 18-6-6 6-6" />
                </svg>

                Back
              </button>

              <span className="text-center text-[10px] text-slate-500 sm:text-xs">
                {activeStep + 1} of {steps.length}
              </span>

              {activeStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={
                    (activeStep === 1 &&
                      (statesLoading || !selectedIndicator?.key)) ||
                    (activeStep === 2 &&
                      (statesLoading || states.length === 0))
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1F7A3F] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#176332] disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-5 sm:text-sm"
                >
                  Continue

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateComparison}
                  disabled={loading || !selectedIndicator?.key}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1F7A3F] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#176332] disabled:cursor-wait disabled:opacity-70 sm:gap-2 sm:px-5 sm:text-sm"
                >
                  {loading ? "Checking sign-in..." : "Generate"}

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </button>
              )}
            </div>

            {/* LOGIN MESSAGE */}

            {activeStep === 4 && !isLoggedIn && !loading && (
              <p className="mt-4 text-center text-xs leading-relaxed text-slate-600">
                You can configure your comparison without logging in.
                Sign in is required to generate it.
              </p>
            )}

          </SectionCard>
        </motion.div>
      </main>
    </div>
  );
}

export default Explore;
