import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  revealVariants,
  staggerContainer,
  useMotionSettings,
} from "../animation.js";

import { useAuth } from "../context/AuthContext.jsx";
import { getStates } from "../api/referenceData.js";

import civicIntel from "../assets/civicintel.hero.logo.png";
import civicIntelLogo from "../assets/civicintellogo1.png";
import HealthPic1 from "../assets/health/Health1.png";
import HealthPic2 from "../assets/health/Health2.png";
import HealthPic3 from "../assets/health/Health3.png";

const overviewStats = [
  {
    label: "COVERAGE",
    value: "67.4%",
    description: "ANC 4+ Coverage",
    source: "NDHS • 2023",
    color: "#1F7A3F",
  },
  {
    label: "OUTCOMES",
    value: "512",
    description: "Maternal mortality /100k",
    source: "NDHS • 2023",
    color: "#8B2922",
  },
  {
    label: "COVERAGE",
    value: "57%",
    description: "Full immunization 12–23mon",
    source: "NDHS • 2023",
    color: "#145C3B",
  },
  {
    label: "SYSTEM",
    value: "1:4",
    description: "Doctor-to-population",
    source: "FMCH • 2022",
    color: "#0B3C5D",
  },
  {
    label: "FINANCING",
    value: "67.4%",
    description: "Health share of state budget",
    source: "BudgetIT • 2025",
    color: "#D6A400",
  },
];

// These are demonstration chart values, not live backend health statistics.
const demoStateData = [
  { state: "Imo", value: 86.8, zone: "SE" },
  { state: "Lagos", value: 82.5, zone: "SW" },
  { state: "Ogun", value: 76.1, zone: "SW" },
  { state: "Oyo", value: 71.4, zone: "SW" },
  { state: "Rivers", value: 68.2, zone: "SS" },
  { state: "Kaduna", value: 53.0, zone: "NW" },
  { state: "Kano", value: 48.2, zone: "NW" },
  { state: "Borno", value: 39.5, zone: "NE" },
  { state: "Sokoto", value: 28.3, zone: "NW" },
];

const releases = [
  {
    category: "Health • Kano state",
    title: "Immunisation coverage trends 2019 to 2024",
    image: HealthPic1,
  },
  {
    category: "Health • National",
    title: "Maternal mortality: state-by-state, 2023",
    image: HealthPic2,
  },
  {
    category: "Health • Rivers state",
    title: "Health budget execution, FY2025",
    image: HealthPic3,
  },
];

function SectionHeading({ children, dark = false }) {
  return (
    <h2
      className={`mb-6 flex items-center gap-2 text-xl font-bold sm:text-2xl ${
        dark ? "text-white" : "text-[#20272B]"
      }`}
    >
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#1F7A3F]" />
      {children}
    </h2>
  );
}

function Health() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  // Reuse CivicIntel's shared animation settings.
  const motionSettings = useMotionSettings();

  // Restore filter choices when the user returns from login.
  const restoredFilters = location.state?.healthFilters;

  const [indicator, setIndicator] = useState(
    restoredFilters?.indicator ?? "anc"
  );

  const [state, setState] = useState(
    restoredFilters?.state ?? "all"
  );

  const [year, setYear] = useState(
    restoredFilters?.year ?? "2020-2024"
  );

  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [statesError, setStatesError] = useState("");

  const [appliedFilters, setAppliedFilters] = useState(
    isLoggedIn && restoredFilters ? restoredFilters : null
  );

  const [hasAppliedFilters, setHasAppliedFilters] = useState(
    Boolean(isLoggedIn && restoredFilters)
  );

  const [animatedValues, setAnimatedValues] = useState({});

  // Fetch the available states once when the Health page mounts.
    useEffect(() => {
    let isMounted = true;

    async function loadStates() {
      try {
        setStatesError("");

        const data = await getStates();

        if (!Array.isArray(data)) {
          throw new Error("The states response was not a list.");
        }

        if (isMounted) {
          setStates(data);
        }
      } catch (error) {
        if (isMounted) {
          setStatesError(
            error instanceof Error
              ? error.message
              : "Could not load states. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setStatesLoading(false);
        }
      }
    }

    loadStates();

    return () => {
      isMounted = false;
    };
  }, []);

  // Animate demonstration chart bars after the filters have been applied.
    useEffect(() => {
    if (!isLoggedIn || !hasAppliedFilters || !appliedFilters) {
      return undefined;
    }

    let firstFrame;
    let secondFrame;

    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        const filteredData = demoStateData.filter(
          (item) =>
            appliedFilters.state === "all" ||
            item.state === appliedFilters.state
        );

        setAnimatedValues(
          Object.fromEntries(
            filteredData.map((item) => [item.state, item.value])
          )
        );
      });
    });

    return () => {
      if (firstFrame !== undefined) {
        cancelAnimationFrame(firstFrame);
      }

      if (secondFrame !== undefined) {
        cancelAnimationFrame(secondFrame);
      }
    };
  }, [
    isLoggedIn,
    hasAppliedFilters,
    appliedFilters,
  ]);

  const handleApplyFilters = (event) => {
    event.preventDefault();

    const filters = { indicator, state, year };

    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: {
            pathname: "/health",
            state: {
              healthFilters: filters,
            },
          },
          message:
            "Please log in to view health charts and analysis.",
        },
      });

      return;
    }

    setAppliedFilters(filters);
    setHasAppliedFilters(true);
  };

  const handleLogin = () => {
    navigate("/login", {
      state: {
        from: {
          pathname: "/health",
          state: {
            healthFilters: { indicator, state, year },
          },
        },
        message:
          "Please log in to access health data analysis.",
      },
    });
  };

  const handleSignup = () => {
    navigate("/signup", {
      state: {
        from: {
          pathname: "/health",
          state: {
            healthFilters: { indicator, state, year },
          },
        },
      },
    });
  };

  const indicatorLabel =
    appliedFilters?.indicator === "anc"
      ? "ANC 4+ Attendance"
      : appliedFilters?.indicator === "immunization"
        ? "Full Immunization Coverage"
        : "Maternal Mortality";

  return (
    <main className="bg-[#E8EEF1] text-[#20272B]">
      {/* HERO */}
      <motion.section
        {...motionSettings}
        variants={revealVariants}
        className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-24 sm:px-8 md:min-h-92.5 md:grid-cols-2 md:py-12 lg:px-12 lg:py-24 sm:py-8"
      >
        <div className="order-2 md:order-1">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#1F7A3F]">
            Nigeria · Health data
          </p>

          <h1 className="max-w-xl text-3xl font-bold leading-tight text-[#0B3C5D] sm:text-4xl lg:text-5xl">
            Nigeria&apos;s{" "}
            <span className="text-[#1F7A3F]">Health</span>{" "}
            indicators, by state and over time
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-[#38464D]">
            Explore coverage, outcomes, and system indicators drawn from
            national surveys and administrative sources, filterable by state
            and year.
          </p>
        </div>

        <div className="order-1 flex justify-center md:order-2 md:justify-end">
          <div className="relative h-64 w-full max-w-xs rounded-bl-[80px] rounded-tr-[80px] bg-[#0B3C5D] sm:h-80 md:h-82.5 lg:h-120.25 lg:max-w-md">
            <img
              src={civicIntel}
              alt="Digital technology and data visualisation"
              className="h-full w-full rounded-bl-[80px] rounded-tr-[80px] object-cover opacity-80"
            />

            <img
              src={civicIntelLogo}
              alt="CivicIntel logo"
              className="absolute -bottom-10 -right-4 z-10 h-auto w-24 object-contain sm:w-28 md:w-32"
            />
          </div>
        </div>
      </motion.section>

      {/* NATIONAL OVERVIEW */}
      <section className="bg-[#0B3C5D] px-5 py-8 sm:px-8 lg:px-12">
        <motion.div
          {...motionSettings}
          variants={staggerContainer}
          className="mx-auto max-w-5xl"
        >
          <SectionHeading dark>
            NATIONAL HEALTH OVERVIEW
          </SectionHeading>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            {overviewStats.map((stat) => (
              <motion.article
                key={stat.description}
                variants={revealVariants}
                className="group min-h-32 cursor-pointer rounded-md border border-transparent border-l-4 bg-[#F0F1F0] p-4 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#1F7A3F] hover:shadow-lg active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A3F]"
                style={{ borderLeftColor: stat.color }}
              >
                <span
                  className="inline-block rounded-full px-3 py-1 text-[9px] font-medium text-white transition-transform duration-300 group-hover:scale-105 group-active:scale-105"
                  style={{ backgroundColor: stat.color }}
                >
                  {stat.label}
                </span>

                <p className="mt-2 text-xl font-bold text-[#20272B] transition-transform duration-300 ease-out group-hover:scale-105 group-active:scale-105">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs leading-5 text-[#20272B]">
                  {stat.description}
                </p>

                <div className="my-3 border-t border-dashed border-gray-400" />

                <p className="text-[10px] text-gray-600">
                  {stat.source}
                </p>
              </motion.article>
            ))}
          </motion.div>

          <p className="mt-4 text-xs text-white/60">
            Demonstration values only. Figures and source dates must be
            verified before publication.
          </p>
        </motion.div>
      </section>

      {/* HEALTH FILTERS */}
      <section className="bg-[#EAF2EC] px-5 py-8 sm:px-8 lg:px-12">
        <motion.div
          {...motionSettings}
          variants={revealVariants}
          className="mx-auto max-w-5xl"
        >
          <SectionHeading>HEALTH INDICATOR</SectionHeading>

          <form onSubmit={handleApplyFilters}>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-2 text-xs">
                Indicator

                <select
                  value={indicator}
                  onChange={(event) => setIndicator(event.target.value)}
                  className="w-full rounded-xl border border-[#B7C5CB] bg-[#C5D2D9] px-3 py-3 text-sm outline-none focus:border-[#1F7A3F]"
                >
                  <option value="anc">
                    Antenatal Care (ANC 4+ Visits)
                  </option>
                  <option value="immunization">
                    Full Immunization Coverage
                  </option>
                  <option value="maternal">Maternal Mortality</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-xs">
                State

                <select
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  disabled={statesLoading || states.length === 0}
                  className="w-full rounded-xl border border-[#B7C5CB] bg-[#C5D2D9] px-3 py-3 text-sm outline-none focus:border-[#1F7A3F] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <option value="all">All states and FCT</option>

                  {states.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>

                {statesLoading && (
                  <span className="text-xs text-gray-500" role="status">
                    Loading states...
                  </span>
                )}

                {statesError && (
                  <span className="text-xs text-red-600" role="alert">
                    {statesError}
                  </span>
                )}

                {statesError && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatesError("");
                      setStatesLoading(true);

                      getStates()
                        .then((data) => {
                          if (!Array.isArray(data)) {
                            throw new Error(
                              "The states response was not a list."
                            );
                          }

                          setStates(data);
                        })
                        .catch((error) => {
                          setStatesError(
                            error.message || "Could not load states."
                          );
                        })
                        .finally(() => setStatesLoading(false));
                    }}
                    className="self-start text-xs font-semibold text-[#1F7A3F] underline"
                  >
                    Try again
                  </button>
                )}
              </label>

              <label className="flex flex-col gap-2 text-xs">
                Year

                <select
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className="w-full rounded-xl border border-[#B7C5CB] bg-[#C5D2D9] px-3 py-3 text-sm outline-none focus:border-[#1F7A3F]"
                >
                  <option value="2020-2024">2020–2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="mx-auto mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176331] active:scale-[0.99] md:w-1/2"
            >
              Apply <span aria-hidden="true">→</span>
            </button>
          </form>
        </motion.div>
      </section>

      {/* CHART AND ANALYSIS */}
      <section className="bg-[#082C40] px-5 py-8 text-white sm:px-8 lg:px-12">
        <motion.div
          {...motionSettings}
          variants={revealVariants}
          className="mx-auto max-w-5xl"
        >
          {!isLoggedIn ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-8 text-center sm:p-10">
              <h2 className="text-xl font-bold sm:text-2xl">
                Unlock Health Data Analysis
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/70">
                Create an account or log in to view health charts, explore
                filtered data, and save or export your analysis.
              </p>

              <button
                type="button"
                onClick={handleLogin}
                className="mt-6 rounded-full bg-[#1F7A3F] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#176331] active:scale-[0.98]"
              >
                Log in to view data →
              </button>

              <p className="mt-4 text-xs text-white/50">
                New to CivicIntel?{" "}
                <button
                  type="button"
                  onClick={handleSignup}
                  className="underline hover:text-white"
                >
                  Create an account
                </button>
              </p>
            </div>
          ) : !hasAppliedFilters || !appliedFilters ? (
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center">
              <h2 className="text-xl font-bold">Your Health Analysis</h2>

              <p className="mt-3 text-sm leading-6 text-white/70">
                Select your indicator, state, and year above, then click Apply
                to view the chart and analysis.
              </p>
            </div>
          ) : (
            <div className="grid gap-7 lg:grid-cols-[1.8fr_0.8fr]">
              <div className="rounded-sm bg-white p-4 text-[#20272B] shadow-sm transition-all duration-300 ease-out hover:shadow-lg active:scale-[0.995] sm:p-6">
                <div className="mb-5">
                  <p className="text-base font-bold text-[#0B3C5D]">
                    {indicatorLabel} by Selected States
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Demonstration data — not verified health statistics
                  </p>
                </div>

                <div className="space-y-5">
                  {demoStateData
                    .filter(
                      (item) =>
                        appliedFilters.state === "all" ||
                        item.state === appliedFilters.state
                    )
                    .map((item, index) => {
                      const animatedValue = animatedValues[item.state] ?? 0;

                      return (
                        <div
                          key={item.state}
                          className="grid grid-cols-[48px_minmax(0,1fr)_40px] items-center gap-2"
                        >
                          <span className="text-xs font-medium">
                            {item.state}
                          </span>

                          <div className="h-5 overflow-hidden rounded-sm bg-[#E5EAED] ring-1 ring-transparent transition-all duration-300 focus-within:ring-[#1F7A3F]">
                            <div
                              className="flex h-full items-center justify-end rounded-sm bg-[#164C32] pr-2 text-[10px] font-semibold text-white transition-[width] duration-1000 ease-out hover:brightness-110 active:brightness-125 motion-reduce:transition-none"
                              style={{
                                width: `${animatedValue}%`,
                                transitionDelay: `${index * 100}ms`,
                              }}
                              role="progressbar"
                              aria-label={`${item.state} demonstration health indicator`}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={animatedValue}
                            >
                              {animatedValue > 0 ? `${item.value}%` : ""}
                            </div>
                          </div>

                          <span className="text-right text-[10px] text-gray-500">
                            {item.zone}
                          </span>
                        </div>
                      );
                    })}

                  {appliedFilters.state !== "all" &&
                    !demoStateData.some(
                      (item) => item.state === appliedFilters.state
                    ) && (
                      <p className="rounded-lg bg-[#E8EEF1] p-4 text-sm text-gray-600">
                        No demonstration chart is available for{" "}
                        {appliedFilters.state}. Real health statistics will
                        appear here when the verified dataset is connected.
                      </p>
                    )}
                </div>

                <div className="mt-6 flex justify-between border-t border-gray-200 pt-3 text-[10px] text-gray-500">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>

                <div className="mt-8 rounded-md bg-[#E8EEF1] p-4">
                  <p className="text-xs font-bold text-[#145C3B]">
                    DATA PROVENANCE RECORD
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    Primary source, data vintage, audit date, licence, and
                    methodology will be displayed here when verified datasets
                    are connected.
                  </p>
                </div>
              </div>

              <aside className="space-y-6">
                <div>
                  <span className="bg-white px-2 py-1 text-[10px] text-[#0B3C5D]">
                    Analysis brief
                  </span>

                  <p className="mt-3 text-lg font-bold">
                    Health indicators across Nigeria
                  </p>

                  <p className="mt-3 text-sm leading-6 text-white/65">
                    Compare health outcomes by state, explore changes over
                    time, and review the sources behind each indicator.
                  </p>

                  <p className="mt-3 text-xs leading-5 text-white/50">
                    Selected filters:{" "}
                    {appliedFilters.state === "all"
                      ? "All states"
                      : appliedFilters.state}
                    {" · "}
                    {appliedFilters.year}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      window.alert(
                        "Export will be enabled when the dataset is connected."
                      )
                    }
                    className="mt-3 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-5 py-3 text-sm font-semibold transition hover:bg-[#176331] active:scale-[0.98]"
                  >
                    Export data
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      window.alert(
                        "Saving will be enabled when user accounts and the backend are connected."
                      )
                    }
                    className="mt-3 w-full rounded-full bg-[#1F7A3F] px-5 py-3 text-sm font-semibold transition hover:bg-[#176331] active:scale-[0.98]"
                  >
                    Save indicator ♧
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold">Facility Spot Check</h3>

                  <p className="mt-2 text-sm leading-6 text-white/65">
                    A future map will show verified health facilities and
                    their locations.
                  </p>

                  <div className="mt-4 flex min-h-44 items-center justify-center rounded-lg border border-white/20 bg-white/10 p-6 text-center transition-all duration-300 hover:bg-white/15 active:scale-[0.99]">
                    <div>
                      <p className="text-3xl" aria-hidden="true">
                        ⌖
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        Facility map
                      </p>

                      <p className="mt-1 text-xs text-white/60">
                        Map integration coming with verified facility data
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </motion.div>
      </section>

      {/* LATEST HEALTH RELEASES */}
      <section className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionHeading>LATEST HEALTH RELEASE</SectionHeading>

            <a
              href="#health-releases"
              className="mb-6 text-xs font-semibold text-[#1F7A3F] transition-colors hover:underline"
            >
              View all releases →
            </a>
          </div>

          <div id="health-releases">
            <motion.div
              {...motionSettings}
              variants={staggerContainer}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {releases.map((release) => (
                <motion.article
                  key={release.title}
                  variants={revealVariants}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gray-200 hover:shadow-lg active:scale-[0.99] focus-within:border-[#1F7A3F]"
                >
                  <div className="overflow-hidden">
                    <img
                      src={release.image}
                      alt=""
                      loading="lazy"
                      className="h-48 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-active:scale-[1.02]"
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-[10px] text-gray-500">
                      {release.category}
                    </p>

                    <h3 className="mt-3 text-sm font-semibold leading-6">
                      {release.title}
                    </h3>

                    <p className="mt-3 text-xs text-[#1F7A3F]">
                      Demonstration release
                    </p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Health;
