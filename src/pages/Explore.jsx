
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ExploreHeroPic from "../assets/Explore.hero.png";

const states = [
  "Lagos",
  "Ekiti",
  "Oyo",
  "Ogun",
  "Kano",
  "Kogi",
  "Kebbi",
  "Imo",
  "Abia",
  "Osun",
  "Kwara",
  "Delta",
  "Anambra",
  "Enugu",
  "Rivers",
  "Kaduna",
  "Bauchi",
  "Benue",
  "Edo",
  "Ondo",
  "Plateau",
  "Sokoto",
  "Borno",
  "Niger",
  "Adamawa",
  "Akwa Ibom",
  "Bayelsa",
  "Cross River",
  "Ebonyi",
  "Gombe",
  "Jigawa",
  "Katsina",
  "Nasarawa",
  "Taraba",
  "Yobe",
  "Zamfara",
  "FCT",
];

const indicatorsByDomain = {
  Health: [
    "Antenatal Care (ANC 4+ Visits)",
    "Maternal mortality ratio",
    "Skilled birth attendance",
    "Health insurance coverage",
    "Healthcare facility density",
    "Child immunization coverage",
    "Under-five mortality rate",
  ],
  Education: [
    "Primary school completion",
    "Out-of-school children",
    "Secondary school enrolment",
    "Literacy rate",
    "Education expenditure",
    "Teacher-to-pupil ratio",
    "School attendance rate",
  ],
};

const steps = [
  "Domain",
  "Indicator",
  "States",
  "Years",
  "Review",
];

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

function ExploreHero() {
  return (
    <section className="bg-[#062638] text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 sm:px-8 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-12  ">
        <div>
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
        </div>

        <div className="h-56 overflow-hidden rounded-xl bg-[#0B3C5D] sm:h-72 lg:h-80">
          <img
            src={ExploreHeroPic}
            alt="Organised public records and documents"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}



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
              {/* CONNECTOR ARROW BETWEEN THIS STEP AND THE NEXT */}
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
                  {/* LONG HORIZONTAL LINE */}
                  <path d="M0 12 H94" />

                  {/* ARROWHEAD */}
                  <path d="M86 5 L94 12 L86 19" />
                </svg>
              )}

              {/* STEP CIRCLE AND LABEL */}
              <button
                type="button"
                onClick={() => onStepClick(index)}
                disabled={index > activeStep}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${index + 1}: ${step}`}
                className="relative z-10 flex flex-col items-center disabled:cursor-not-allowed"
              >
                {/* NUMBER OR COMPLETED CHECKMARK */}
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

                {/* STEP LABEL */}
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

function Explore() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, loading } = useAuth();

  const restoredDraft = location.state?.exploreDraft;

  const initialDomain =
    restoredDraft?.domain === "Education"
      ? "Education"
      : "Health";

  const [domain, setDomain] = useState(initialDomain);

  const [indicator, setIndicator] = useState(() =>
    indicatorsByDomain[initialDomain].includes(
      restoredDraft?.indicator
    )
      ? restoredDraft.indicator
      : indicatorsByDomain[initialDomain][0]
  );

  const [selectedStates, setSelectedStates] = useState(() => {
    const restoredStates = restoredDraft?.selectedStates;

    if (Array.isArray(restoredStates)) {
      return [
        ...new Set(
          restoredStates.filter((state) => states.includes(state))
        ),
      ];
    }

    return ["Oyo", "Kano"];
  });

  const [fromYear, setFromYear] = useState(() => {
    const year = Number(restoredDraft?.fromYear);

    return year >= 2010 && year <= 2025
      ? String(year)
      : "2021";
  });

  const [toYear, setToYear] = useState(() => {
    const year = Number(restoredDraft?.toYear);

    return year >= 2010 && year <= 2025
      ? String(year)
      : "2025";
  });

  const [activeStep, setActiveStep] = useState(0);
  const [comparisonMessage, setComparisonMessage] = useState("");

  const availableIndicators = indicatorsByDomain[domain];

  const years = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) =>
        String(2010 + index)
      ),
    []
  );

  const toggleState = (state) => {
    setComparisonMessage("");

    setSelectedStates((previous) =>
      previous.includes(state)
        ? previous.filter((item) => item !== state)
        : [...previous, state]
    );
  };

  const changeDomain = (nextDomain) => {
    setDomain(nextDomain);
    setIndicator(indicatorsByDomain[nextDomain][0]);
    setComparisonMessage("");
  };

  const handleStepClick = (index) => {
    if (index <= activeStep) {
      setActiveStep(index);
      setComparisonMessage("");
    }
  };

  const handleNextStep = () => {
    setComparisonMessage("");

    if (activeStep === 2 && selectedStates.length < 2) {
      setComparisonMessage(
        "Please select at least two states to compare."
      );
      return;
    }

    if (activeStep === 3 && Number(fromYear) > Number(toYear)) {
      setComparisonMessage(
        "The starting year must not be later than the ending year."
      );
      return;
    }

    setActiveStep((current) => Math.min(current + 1, 4));
  };

  const handlePreviousStep = () => {
    setComparisonMessage("");
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const handleGenerateComparison = () => {
    if (selectedStates.length < 2) {
      setComparisonMessage(
        "Please select at least two states to compare."
      );
      setActiveStep(2);
      return;
    }

    if (Number(fromYear) > Number(toYear)) {
      setComparisonMessage(
        "The starting year must not be later than the ending year."
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
      indicator,
      selectedStates,
      fromYear,
      toYear,
    };

    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: { pathname: "/explore" },
          exploreDraft: comparison,
          message:
            "Log in to generate your comparison. Your selections will be kept.",
        },
      });

      return;
    }

    navigate("/compare-results", {
      state: { comparison },
    });
  };

  return (
    <div className="min-h-screen bg-[#B4C6D0]">
      <ExploreHero />

      <StepProgress
        activeStep={activeStep}
        onStepClick={handleStepClick}
      />

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-7 sm:px-8 sm:pt-9">
        <SectionCard className="min-h-85 sm:min-h-97.5">
          {/* STEP 1: CHOOSE DOMAIN */}
          {activeStep === 0 && (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#1F7A3F]">
                Step 1 of 5
              </p>

              <SectionHeading>Choose a domain</SectionHeading>

              <SectionDescription>
                What type of public data would you like to explore?
                Choose Health or Education to see the available indicators.
              </SectionDescription>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DomainOption
                  domain="Health"
                  selected={domain === "Health"}
                  onClick={() => changeDomain("Health")}
                />

                <DomainOption
                  domain="Education"
                  selected={domain === "Education"}
                  onClick={() => changeDomain("Education")}
                />
              </div>
            </>
          )}

          {/* STEP 2: SELECT INDICATOR */}
          {activeStep === 1 && (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#1F7A3F]">
                Step 2 of 5
              </p>

              <SectionHeading>Select an indicator</SectionHeading>

              <SectionDescription>
                Choose the specific {domain.toLowerCase()} indicator
                you want to compare across states.
              </SectionDescription>

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
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">
                  Selected indicator
                </p>

                <p className="mt-1 text-sm font-semibold text-[#0B3C5D]">
                  {indicator}
                </p>
              </div>
            </>
          )}

          {/* STEP 3: SELECT STATES */}
          {activeStep === 2 && (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#1F7A3F]">
                Step 3 of 5
              </p>

              <SectionHeading>Select states to compare</SectionHeading>

              <SectionDescription>
                Choose at least two Nigerian states. You can select
                additional states to compare a wider range of locations.
              </SectionDescription>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                {states.map((state) => {
                  const selected = selectedStates.includes(state);

                  return (
                    <button
                      type="button"
                      key={state}
                      onClick={() => toggleState(state)}
                      aria-pressed={selected}
                      className={`min-w-0 rounded-lg border px-2 py-3 text-xs transition sm:text-sm ${
                        selected
                          ? "border-[#1F7A3F] bg-[#1F7A3F] font-semibold text-white"
                          : "border-slate-300 bg-white text-slate-600 hover:border-[#1F7A3F] hover:text-[#1F7A3F]"
                      }`}
                    >
                      {state}
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

          {/* STEP 4: SELECT YEARS */}
          {activeStep === 3 && (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#1F7A3F]">
                Step 4 of 5
              </p>

              <SectionHeading>Choose your year range</SectionHeading>

              <SectionDescription>
                Select the starting and ending years for your{" "}
                {indicator.toLowerCase()} comparison.
              </SectionDescription>

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
                    value={fromYear}
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
                    value={toYear}
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
                  {fromYear} – {toYear}
                </p>
              </div>
            </>
          )}

          {/* STEP 5: REVIEW */}
          {activeStep === 4 && (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#1F7A3F]">
                Step 5 of 5
              </p>

              <SectionHeading>Review your comparison</SectionHeading>

              <SectionDescription>
                Confirm your selections before generating your comparison.
              </SectionDescription>

              <dl className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white px-4">
                {[
                  ["Domain", domain],
                  ["Indicator", indicator],
                  [
                    "States",
                    selectedStates.length
                      ? selectedStates.join(", ")
                      : "None selected",
                  ],
                  ["Year range", `${fromYear} – ${toYear}`],
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
                Your comparison will use the domain, indicator, states,
                and years shown above.
              </p>
            </>
          )}

          {/* VALIDATION MESSAGE */}
          {comparisonMessage && (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 sm:text-sm"
            >
              {comparisonMessage}
            </p>
          )}

          {/* BACK AND CONTINUE / GENERATE BUTTONS */}
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
                className="inline-flex items-center gap-1.5 rounded-full bg-[#1F7A3F] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#176332] sm:gap-2 sm:px-5 sm:text-sm"
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
                disabled={loading}
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

          {activeStep === 4 && !isLoggedIn && !loading && (
            <p className="mt-4 text-center text-xs leading-relaxed text-slate-600">
              You can configure your comparison without logging in.
              Sign in is required to generate it.
            </p>
          )}
        </SectionCard>
      </main>
    </div>
  );
}

export default Explore;
