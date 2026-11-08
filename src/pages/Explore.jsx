
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useAuth } from "../context/AuthContext.jsx";
import {
  getCompareOptions,
  getStates,
} from "../api/referenceData.js";

import ExploreHeroPic from "../assets/Explore.hero.jpg";

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

function unwrapList(response, key) {
  const data = unwrapResponse(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.[key])) {
    return data[key];
  }

  return null;
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
          <p className="text-xs font-medium uppercase tracking-wide text-white/80 mt-10">
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
          className="relative z-10 h-72 overflow-hidden rounded-xl  shadow-2xl shadow-black/25 transition-transform duration-500 hover:-translate-y-1 sm:h-72 lg:h-80.25"
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
        const [compareOptionsResponse, statesResponse] =
          await Promise.all([
            getCompareOptions(),
            getStates(),
          ]);

        const compareOptionsData = unwrapResponse(
          compareOptionsResponse
        );

        const indicatorsData = compareOptionsData?.indicators;

        const statesData = unwrapList(
          statesResponse,
          "states"
        );

        if (!Array.isArray(indicatorsData) || !statesData) {
          throw new Error(
            "The backend did not return valid comparison options."
          );
        }

        if (isMounted) {
          setIndicators(indicatorsData);
          setStates(statesData);
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

  const retryLoadOptions = async () => {
    try {
      setStatesLoading(true);
      setStatesError("");

      const [compareOptionsResponse, statesResponse] =
        await Promise.all([
          getCompareOptions(),
          getStates(),
        ]);

      const compareOptionsData = unwrapResponse(
        compareOptionsResponse
      );

      const indicatorsData = compareOptionsData?.indicators;

      const statesData = unwrapList(
        statesResponse,
        "states"
      );

      if (!Array.isArray(indicatorsData) || !statesData) {
        throw new Error(
          "The backend did not return valid comparison options."
        );
      }

      setIndicators(indicatorsData);
      setStates(statesData);
    } catch (error) {
      setStatesError(
        error.message ||
          "Could not load comparison options."
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

  const [selectedYears, setSelectedYears] = useState(() => {
    return Array.isArray(restoredDraft?.selectedYears)
      ? restoredDraft.selectedYears.map(Number)
      : [];
  });
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  const yearDropdownRef = useRef(null);
    useEffect(() => {
    function handleOutsideClick(event) {
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target)
      ) {
        setIsYearDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

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

  

  const availableYears = useMemo(() => {
  return Array.isArray(selectedIndicator?.years)
    ? [...selectedIndicator.years].sort((a, b) => a - b)
    : [];
}, [selectedIndicator]);

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
  setSelectedYears([]);
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

    // Validate year selection.
if (activeStep === 3 && selectedYears.length === 0) {
  setComparisonMessage(
    "Please select at least one available year."
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

  if (selectedYears.length === 0) {
    setComparisonMessage(
      "Please select at least one available year."
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

  const comparison = {
    domain,
    indicator: selectedIndicator.key,
    indicatorKey: selectedIndicator.key,
    indicatorName: selectedIndicator.name,
    unit: selectedIndicator.unit || "",
    category: selectedIndicator.category || "",
    selectedStates,
    selectedYears,
  };

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
                      value={indicator || selectedIndicator?.key || ""}
                      onChange={(event) => {
  setIndicator(event.target.value);
  setSelectedYears([]);
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
                  Select available years
                </SectionHeading>

                <SectionDescription>
                  Choose one or more years for your{" "}
                  {selectedIndicator?.name?.toLowerCase() || "indicator"}{" "}
                  comparison. Only years supported by this indicator are shown.
                </SectionDescription>

                {availableYears.length === 0 ? (
                  <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    No years are currently available for this indicator.
                  </p>
                ) : (
                  <div ref={yearDropdownRef} className="relative mt-5">
                    {/* DROPDOWN TRIGGER */}
                    <button
                      type="button"
                      onClick={() =>
                        setIsYearDropdownOpen((previous) => !previous)
                      }
                      aria-expanded={isYearDropdownOpen}
                      aria-controls="year-options"
                      className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-sm text-[#0B3C5D] transition hover:border-[#1F7A3F] focus:outline-none focus:ring-2 focus:ring-[#1F7A3F]/20"
                    >
                      <span>
                        {selectedYears.length > 0
                          ? `${selectedYears.length} year${selectedYears.length === 1 ? "" : "s"} selected`
                          : "Select years"}
                      </span>

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-4 w-4 transition-transform ${
                          isYearDropdownOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>

                    {/* DROPDOWN OPTIONS */}
                    {isYearDropdownOpen && (
                      <div
                        id="year-options"
                        className="absolute left-0 right-0 z-20 mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
                      >
                        {availableYears.map((year) => {
                          const numericYear = Number(year);
                          const isSelected = selectedYears.includes(numericYear);

                          return (
                            <label
                              key={year}
                              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-700 transition hover:bg-[#F0F5F1]"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedYears((previous) =>
                                    previous.includes(numericYear)
                                      ? previous.filter(
                                          (item) => item !== numericYear
                                        )
                                      : [...previous, numericYear].sort(
                                          (a, b) => a - b
                                        )
                                  );

                                  setComparisonMessage("");
                                }}
                                className="h-4 w-4 accent-[#1F7A3F]"
                              />

                              <span>{numericYear}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* SELECTED YEARS */}
                    <div className="mt-4 rounded-lg bg-white p-4">
                      <p className="text-xs text-slate-500">
                        Selected years
                      </p>

                      <p className="mt-1 text-base font-bold text-[#0B3C5D]">
                        {selectedYears.length > 0
                          ? [...selectedYears].sort((a, b) => a - b).join(", ")
                          : "No years selected"}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        Select at least one year to continue.
                      </p>
                    </div>
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
  "Selected years",
  selectedYears.length
    ? [...selectedYears]
        .sort((a, b) => a - b)
        .join(", ")
    : "None selected",
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
