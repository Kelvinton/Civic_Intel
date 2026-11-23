
import { useEffect, useMemo, useRef, useState } from "react";
import { Link,  useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown, Share2 } from "lucide-react";

import {
  revealVariants,
  staggerContainer,
  useMotionSettings,
} from "../animation.js";

import { useAuth } from "../context/AuthContext.jsx";
import { getStates } from "../api/referenceData.js";
import { getPublishedRecords } from "../api/publishedData.js";
import {
  getMedia,
  subscribeToMedia,
} from "../api/media.js";

import governanceHero from "../assets/governance.hero.jpg";
import civicIntelLogo from "../assets/civicintellogo1.png";

function isValidNumericValue(value) {
  return (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== "" &&
    Number.isFinite(Number(value))
  );
}

function SectionHeading({ children, dark = false }) {
  return (
    <h2
      className={`mb-6 flex items-center gap-2 text-xl font-bold sm:text-2xl ${
        dark ? "text-white" : "text-[#20272B]"
      }`}
    >
      <motion.span
        aria-hidden="true"
        className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#1F7A3F]"
        animate={{
          opacity: [1, 0.75, 1],
          scale: [1, 1.2, 1],
          boxShadow: [
            "0 0 3px rgba(31, 122, 63, 0.4)",
            "0 0 12px rgba(31, 122, 63, 1)",
            "0 0 3px rgba(31, 122, 63, 0.4)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {children}
    </h2>
  );
}

function getSavedGovernanceFilters() {
  try {
    const saved = sessionStorage.getItem("civicintel_governance_filters");

    if (!saved) return null;

    const parsed = JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed.indicator !== "string" ||
      !Array.isArray(parsed.states) ||
      !Array.isArray(parsed.years)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function Governance() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const motionSettings = useMotionSettings();

  const stateDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);

  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [statesError, setStatesError] = useState("");

  const [governanceMedia, setGovernanceMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState("");

  const savedFilters = getSavedGovernanceFilters();

  const [selectedIndicator, setSelectedIndicator] = useState(
    savedFilters?.indicator || ""
  );

  const [selectedStates, setSelectedStates] = useState(
    savedFilters?.states || []
  );

  const [selectedYears, setSelectedYears] = useState(
    savedFilters?.years || []
  );

  const [governanceRecords, setGovernanceRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState("");


  const [exportOpen, setExportOpen] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState(savedFilters);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        stateDropdownRef.current &&
        !stateDropdownRef.current.contains(event.target)
      ) {
        stateDropdownRef.current.removeAttribute("open");
      }

      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target)
      ) {
        yearDropdownRef.current.removeAttribute("open");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // LOAD STATES
  useEffect(() => {
    let isMounted = true;

    async function loadStates() {
      try {
        const response = await getStates();

        if (!Array.isArray(response)) {
          throw new Error("The states response was not a list.");
        }

        if (isMounted) {
          setStates(response);
          setStatesError("");
        }
      } catch (error) {
        if (isMounted) {
          setStatesError(
            error instanceof Error
              ? error.message
              : "Could not load states."
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

  useEffect(() => {
    let isMounted = true;

    const loadGovernanceRecords = async () => {
      try {
        setRecordsLoading(true);
        setRecordsError("");

        const limit = 50;
        let offset = 0;
        let allRecords = [];
        let total = 0;

        do {
          const response = await getPublishedRecords({
            sector: "governance",
            limit,
            offset,
          });

          const items = response?.items || [];

          allRecords = [...allRecords, ...items];
          total = Number(response?.total ?? allRecords.length);

          offset += items.length;

          if (items.length === 0) break;
        } while (offset < total);

        if (isMounted) {
          setGovernanceRecords(allRecords);
        }
      } catch (error) {
        if (isMounted) {
          setRecordsError(
            error.message || "Unable to load Governance records."
          );
        }
      } finally {
        if (isMounted) {
          setRecordsLoading(false);
        }
      }
    };

    loadGovernanceRecords();

    return () => {
      isMounted = false;
    };
  }, []);

  const indicatorOptions = useMemo(() => {
  const indicators = new Map();

  governanceRecords.forEach((record) => {
    const key = record.indicator_key;

    if (!key) return;

    const label =
      record.indicator ||
      record.indicator_name ||
      record.indicator_label ||
      record.name ||
      key;

    indicators.set(key, label);
  });

  return Array.from(indicators, ([value, label]) => ({
    value,
    label,
  }));
}, [governanceRecords]);

  const yearOptions = useMemo(() => {
    return [
      ...new Set(
        governanceRecords
          .map((record) => Number(record.year))
          .filter(Number.isFinite)
      ),
    ].sort((a, b) => b - a);
  }, [governanceRecords]);

  

 
  // LOAD GOVERNANCE MEDIA
  useEffect(() => {
    let isMounted = true;

    function updateGovernanceMedia(response) {
      if (!isMounted || !Array.isArray(response?.items)) return;

      const filteredMedia = response.items.filter((item) =>
        item.category?.toLowerCase().includes("governance")
      );

      setGovernanceMedia(filteredMedia.slice(0, 3));
      setMediaError("");
    }

    const unsubscribe = subscribeToMedia(updateGovernanceMedia);

    async function loadMedia() {
      try {
        const response = await getMedia({
          limit: 50,
          offset: 0,
        });

        if (!response || !Array.isArray(response.items)) {
          throw new Error("The Media response was not in the expected format.");
        }

        updateGovernanceMedia(response);
      } catch (error) {
        if (isMounted) {
          setMediaError(
            error instanceof Error
              ? error.message
              : "Could not load Governance releases."
          );
        }
      } finally {
        if (isMounted) {
          setMediaLoading(false);
        }
      }
    }

    loadMedia();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);


  // FILTER HANDLERS
   const handleApplyFilters = (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: {
            pathname: "/governance",
            hash: "#governance-filters",
          },
          message: "Please log in to access Governance data analysis.",
        },
      });

      return;
    }

    if (!selectedIndicator) return;

    const filters = {
    indicator: selectedIndicator,
    states: selectedStates,
    years: selectedYears,
  };

  sessionStorage.setItem(
    "civicintel_governance_filters",
    JSON.stringify(filters)
  );

  setAppliedFilters(filters);
  };

  const overviewStats = useMemo(() => {
    const indicatorGroups = new Map();

    governanceRecords.forEach((record) => {
      const key = record.indicator_key;
      const state = record.state;
      const year = Number(record.year);
      const value = Number(record.value);

      if (
        !key ||
        typeof state !== "string" ||
        state.toLowerCase() === "national" ||
        !Number.isFinite(year) ||
        !Number.isFinite(value)
      ) {
        return;
      }

      if (!indicatorGroups.has(key)) {
        indicatorGroups.set(key, []);
      }

      indicatorGroups.get(key).push(record);
    });

    return Array.from(indicatorGroups.entries())
      .map(([indicatorKey, records]) => {
        const latestYear = Math.max(
          ...records.map((record) => Number(record.year))
        );

        const latestRecords = records.filter(
          (record) => Number(record.year) === latestYear
        );

        const stateRecords = new Map();

        latestRecords.forEach((record) => {
          if (!stateRecords.has(record.state)) {
            stateRecords.set(record.state, record);
          }
        });

        const values = Array.from(stateRecords.values()).map(
          (record) => Number(record.value)
        );

        const average =
          values.reduce((total, value) => total + value, 0) /
          values.length;

        const firstRecord = records[0];

        return {
          indicatorKey,
          label: firstRecord.indicator || indicatorKey,
          unit: firstRecord.unit || "",
          average,
          latestYear,
          reportingStates: stateRecords.size,
        };
      })
      .sort((a, b) => b.reportingStates - a.reportingStates)
      .slice(0, 5);
  }, [governanceRecords]);

  const filteredGovernanceRecords = useMemo(() => {
    if (!appliedFilters) return [];

    return governanceRecords.filter((record) => {
      const matchesIndicator =
        record.indicator_key === appliedFilters.indicator;

      const matchesState =
        appliedFilters.states.length === 0 ||
        appliedFilters.states.includes(record.state);

      const matchesYear =
        appliedFilters.years.length === 0 ||
        appliedFilters.years.includes(Number(record.year));

      return matchesIndicator && matchesState && matchesYear;
    });
  }, [governanceRecords, appliedFilters]);

  const chartData = useMemo(() => {
    return filteredGovernanceRecords
      .filter(
        (record) =>
          String(record.state ?? "").trim().toLowerCase() !== "national" &&
          isValidNumericValue(record.value)
      )
      .map((record) => ({
        ...record,
        numericValue: Number(record.value),
      }));
  }, [filteredGovernanceRecords]);

  const stateChartData = useMemo(() => {
    return chartData;
  }, [chartData]);
  

  const highestRecord = useMemo(() => {
    if (stateChartData.length === 0) return null;

    return stateChartData.reduce((highest, record) =>
      record.numericValue > highest.numericValue ? record : highest
    );
  }, [stateChartData]);

  const lowestRecord = useMemo(() => {
    if (stateChartData.length === 0) return null;

    return stateChartData.reduce((lowest, record) =>
      record.numericValue < lowest.numericValue ? record : lowest
    );
  }, [stateChartData]);

  const valueDifference =
  highestRecord && lowestRecord
    ? highestRecord.numericValue - lowestRecord.numericValue
    : null;


  const selectedIndicatorRecord = governanceRecords.find(
    (record) => record.indicator_key === selectedIndicator
  );

  const indicatorLabel =
    selectedIndicatorRecord?.indicator ||
    selectedIndicatorRecord?.indicator_name ||
    selectedIndicatorRecord?.indicator_label ||
    selectedIndicatorRecord?.name ||
    selectedIndicator ||
    "Governance indicator";

  const indicatorUnit = selectedIndicatorRecord?.unit || "";

  const chartRows = useMemo(() => {
    const stateGroups = new Map();

    stateChartData.forEach((record) => {
      const state = record.state;
      const year = Number(record.year);

      if (!stateGroups.has(state)) {
        stateGroups.set(state, {
          state,
          chartLabel: state,
        });
      }

      stateGroups.get(state)[String(year)] = record.numericValue;
    });

    return Array.from(stateGroups.values()).sort((a, b) => {
      const aValues = Object.entries(a)
        .filter(([key]) => /^\d{4}$/.test(key))
        .map(([, value]) => value);

      const bValues = Object.entries(b)
        .filter(([key]) => /^\d{4}$/.test(key))
        .map(([, value]) => value);

      return Math.max(...bValues) - Math.max(...aValues);
    });
  }, [stateChartData]);

  const chartYears = useMemo(() => {
    return [
      ...new Set(stateChartData.map((record) => Number(record.year))),
    ].sort((a, b) => a - b);
  }, [stateChartData]);



  

  const transparencyStats = useMemo(() => {
    const reportingStates = new Set(
      stateChartData
        .map((record) => record.state)
        .filter(
          (state) =>
            typeof state === "string" &&
            state.toLowerCase() !== "national"
        )
    );

    const reportingYears = [
      ...new Set(
        stateChartData
          .map((record) => Number(record.year))
          .filter(Number.isFinite)
      ),
    ].sort((a, b) => a - b);

    return {
      reportingStates: reportingStates.size,
      reportingYears,
      recordCount: filteredGovernanceRecords.length,
    };
  }, [stateChartData, filteredGovernanceRecords]);

  const handleLogin = () => {
    navigate("/login", {
      state: {
        from: {
          pathname: "/governance",
        },
        message: "Please log in to access Governance data analysis.",
      },
    });
  };

  const handleSignup = () => {
    navigate("/signup", {
      state: {
        from: {
          pathname: "/governance",
        },
      },
    });
  };

  const retryLoadStates = async () => {
    setStatesLoading(true);
    setStatesError("");

    try {
      const response = await getStates();

      if (!Array.isArray(response)) {
        throw new Error("The states response was not a list.");
      }

      setStates(response);
    } catch (error) {
      setStatesError(
        error instanceof Error
          ? error.message
          : "Could not load states."
      );
    } finally {
      setStatesLoading(false);
    }
  };

  // --------------------------------------------------
  // PAGE UI
  // --------------------------------------------------

  return (
    <main className="bg-[#E8EEF1] text-[#20272B]">

      {/* HERO */}
      <motion.section
        {...motionSettings}
        variants={revealVariants}
        className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-26 pb-16 sm:px-8 sm:pt-36 sm:pb-12 md:min-h-0 md:grid-cols-2 md:gap-8 md:px-8 md:pt-30 md:pb-12 lg:min-h-92.5 lg:gap-10 lg:px-12 lg:py-24"
      >
        <motion.div
          className="order-2 md:order-1"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#1F7A3F]">
            Nigeria · Governance data
          </p>

          <h1 className="max-w-xl text-3xl font-bold leading-tight text-[#0B3C5D] sm:text-4xl lg:text-5xl">
            Nigeria&apos;s{" "}
            <span className="text-[#1F7A3F]">Governance</span>{" "}
            indicators, by state and over time
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-[#38464D]">
            Explore public-sector performance, transparency,
            accountability and governance indicators across Nigeria.
            Compare available records by state and reporting year.
          </p>
        </motion.div>

        <motion.div
          className="order-1 flex justify-center md:order-2 md:justify-end"
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.85,
            delay: 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="relative h-64 w-full max-w-xs rounded-bl-[80px] rounded-tr-[80px] bg-[#0B3C5D] sm:h-80 md:h-82.5 lg:h-120.25 lg:max-w-md">
            <img
              src={governanceHero}
              alt="Governance, transparency and accountability in Nigeria"
              className="h-full w-full rounded-bl-[80px] rounded-tr-[80px] object-cover opacity-80"
            />

            <img
              src={civicIntelLogo}
              alt="CivicIntel logo"
              className="absolute -bottom-10 -right-4 z-10 h-auto w-24 object-contain sm:w-28 md:w-32"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* NATIONAL GOVERNANCE OVERVIEW */}
      <section className="bg-[#0B3C5D] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <SectionHeading dark>
            NATIONAL GOVERNANCE OVERVIEW
          </SectionHeading>

          {recordsLoading ? (
            <p className="text-sm text-white/70">
              Loading Governance indicators...
            </p>
          ) : recordsError ? (
            <p className="text-sm text-white/70">
              {recordsError}
            </p>
          ) : overviewStats.length === 0 ? (
            <p className="text-sm text-white/70">
              No Governance indicators have been published yet.
            </p>
          ) : (
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {overviewStats.map((item, index) => (
                <article
                  key={item.indicatorKey}
                  className="group relative min-h-28 overflow-hidden rounded-md border border-transparent border-l-4 bg-[#F0F1F0] p-3.5 shadow-sm transform-gpu transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-[#1F7A3F] hover:shadow-xl active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
                  style={{
                    borderLeftColor: [
                      "#1F7A3F",
                      "#8B2922",
                      "#145C3B",
                      "#0B3C5D",
                      "#D6A400",
                    ][index % 5],
                    transitionDelay: `${index * 40}ms`,
                  }}
                >
                  <span className="inline-block rounded-full bg-[#0B3C5D] px-3 py-1 text-[9px] font-medium text-white">
                    {item.label}
                  </span>

                  <p className="mt-3 text-lg font-bold text-[#0B3C5D]">
                    {item.average.toLocaleString(undefined, {
                      maximumFractionDigits: 1,
                    })}
                    {item.unit
                      ? item.unit === "%"
                        ? "%"
                        : ` ${item.unit}`
                      : ""}
                  </p>

                  <p className="mt-1 text-xs leading-5">
                    Average across reporting states
                  </p>

                  <div className="my-2 border-t border-dashed border-gray-400" />

                  <p className="text-[10px] text-gray-600">
                    {item.latestYear} · {item.reportingStates} states
                  </p>
                </article>
              ))}
            </div>

          )}
        </div>
      </section>

      {/* GOVERNANCE FILTERS */}
      <section
        className="bg-[#EAF2EC] px-5 py-8 sm:px-8 lg:px-12"
        id="governance-filters"
      >
        <motion.div
          {...motionSettings}
          variants={revealVariants}
          className="mx-auto max-w-5xl"
        >
          <SectionHeading>
            GOVERNANCE INDICATOR
          </SectionHeading>

          <form onSubmit={handleApplyFilters}>
            <div className="grid gap-4 md:grid-cols-3">

              {/* INDICATOR */}
              <label className="flex flex-col gap-2 text-xs">
                <div className="flex min-h-8 flex-col justify-end">
                  <span>Indicator</span>
                </div>

                <div className="relative">
                  <select
                    value={selectedIndicator}
                    onChange={(event) =>
                      setSelectedIndicator(event.target.value)
                    }
                    
                    className="w-full appearance-none rounded-xl border border-[#B7C5CB] bg-[#C5D2D9] px-3 py-3 pr-10 text-sm outline-none opacity-70"
                  >
                    <option value="">Select an indicator</option>

                    {indicatorOptions.map((indicator) => (
                      <option key={indicator.value} value={indicator.value}>
                        {indicator.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />
                </div>
              </label>

              {/* STATE */}
              <label className="flex flex-col gap-2 text-xs">
                <div className="flex min-h-8 flex-col justify-end">
                  <span>State</span>
                  <span>Select one or multiple states</span>
                </div>

                <details
                  ref={stateDropdownRef}
                  className="relative"
                >
                  <summary className="cursor-pointer list-none rounded-xl border border-gray-300 bg-[#C5D2D9] px-4 py-3 text-sm">
                    {selectedStates.length === 0
                      ? "All states"
                      : `${selectedStates.length} states selected`}

                    <ChevronDown
                      size={16}
                      className="float-right shrink-0 text-slate-600"
                    />
                  </summary>

                  <div className="absolute left-0 z-30 mt-2 max-h-64 w-full min-w-48 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                    <label className="flex cursor-pointer items-center gap-2 border-b border-gray-100 pb-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedStates.length === 0}
                        onChange={() => setSelectedStates([])}
                      />
                      All states
                    </label>

                    {states.map((item) => (
                      <label
                        key={item.id ?? item.name}
                        className="flex cursor-pointer items-center gap-2 py-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStates.includes(item.name)}
                          onChange={(event) => {
                            setSelectedStates((previous) =>
                              event.target.checked
                                ? [...previous, item.name]
                                : previous.filter(
                                    (name) => name !== item.name
                                  )
                            );
                          }}
                        />
                        {item.name}
                      </label>
                    ))}
                  </div>
                </details>

                {statesLoading && (
                  <p className="text-xs text-gray-500">
                    Loading available states...
                  </p>
                )}

                {!statesLoading && states.length === 0 && !statesError && (
                  <p className="text-xs text-gray-500">
                    No states available.
                  </p>
                )}

                {statesError && (
                  <button
                    type="button"
                    onClick={retryLoadStates}
                    className="self-start text-xs font-semibold text-[#1F7A3F] underline"
                  >
                    Try again
                  </button>
                )}
              </label>
              
              {/* YEAR */}
              <label className="flex flex-col gap-2 text-xs">
                <div className="flex min-h-8 flex-col justify-end">
                  <span>Year</span>
                  <span>Select single or multiple years</span>
                </div>

                <details
                  ref={yearDropdownRef}
                  className="relative"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-slate-300 bg-[#C5D2D9] px-3 py-3 text-sm text-slate-700">
                    {selectedYears.length === 0
                      ? "All available years"
                      : `${selectedYears.length} years selected`}

                    <ChevronDown
                      size={16}
                      className="shrink-0 text-slate-600"
                    />
                  </summary>

                  <div className="absolute left-0 top-full z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                    <label className="flex cursor-pointer items-center gap-2 border-b border-gray-100 pb-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedYears.length === 0}
                        onChange={() => setSelectedYears([])}
                      />
                      All available years
                    </label>

                    {yearOptions.map((year) => (
                      <label
                        key={year}
                        className="flex cursor-pointer items-center gap-2 py-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedYears.includes(year)}
                          onChange={(event) => {
                            setSelectedYears((previous) =>
                              event.target.checked
                                ? [...previous, year]
                                : previous.filter((item) => item !== year)
                            );
                          }}
                        />
                        {year}
                      </label>
                    ))}
                  </div>
                </details>
              </label>
            </div>

            <button
              type="submit"
              disabled={
                recordsLoading ||
                !selectedIndicator ||
                indicatorOptions.length === 0
              }
              className="mx-auto mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176331] disabled:cursor-not-allowed disabled:opacity-60 md:w-1/2"
            >
              Apply <span aria-hidden="true">→</span>
            </button>
            
          </form>
        </motion.div>
      </section>

      {/* CHART AND ANALYSIS */}
      <section className="bg-[#082C40] px-4 py-10 text-white sm:px-6 lg:px-10">
        <motion.div
          {...motionSettings}
          variants={revealVariants}
          className="mx-auto max-w-5xl"
        >
          {!isLoggedIn ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-8 text-center sm:p-10">
              <h2 className="text-xl font-bold sm:text-2xl">
                Unlock Governance Data Analysis
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/70">
                Log in to CivicIntel to access state-level Governance
                analysis, compare published records and explore
                available data.
              </p>

              <button
                type="button"
                onClick={handleLogin}
                className="mt-6 rounded-full bg-[#1F7A3F] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#176331]"
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
          ) : !appliedFilters ? (
            <div className="mx-auto max-w-5xl rounded-2xl border border-white/20 bg-white/10 px-6 py-10 text-center sm:px-10 sm:py-12">
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Your Governance Analysis
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                Select your Governance indicator, state and reporting year
                above, then click Apply to view the chart and analysis.
              </p>
            </div>
          ) : (
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2.1fr)_minmax(300px,0.9fr)]">

              {/* CHART PANEL */}
              <div className="min-w-0 bg-white p-4 text-[#0B2F45] shadow-xl sm:p-6">
                <h2 className="text-base font-bold sm:text-lg">
                  {indicatorLabel} by Selected States
                </h2>

                <p className="mt-1 text-[11px] text-gray-500">
                  Published state-level data
                </p>

                <div className="mt-8 min-h-64 rounded-lg bg-[#E8EEF1] p-4 sm:p-6">
                  {recordsLoading ? (
                    <div className="flex min-h-64 items-center justify-center text-sm text-gray-500">
                      Loading Governance data...
                    </div>
                  ) : recordsError ? (
                    <div className="flex min-h-64 flex-col items-center justify-center text-center">
                      <p className="text-sm font-semibold text-red-600">
                        Unable to load Governance data.
                      </p>
                      <p className="mt-2 text-sm text-gray-600">{recordsError}</p>
                    </div>
                  ) : !appliedFilters ? (
                    <div className="flex min-h-64 flex-col items-center justify-center text-center">
                      <h3 className="text-base font-bold text-[#0B3C5D]">
                        Apply your filters to view the chart
                      </h3>
                      <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
                        Select a Governance indicator, states and reporting years,
                        then apply your filters to compare the published data.
                      </p>
                    </div>
                  ) : chartRows.length === 0 ? (
                    <div className="flex min-h-64 items-center justify-center text-center text-sm text-gray-600">
                      No Governance records match your selected filters.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <div
                        style={{
                          minWidth: `${Math.max(chartRows.length * 65, 700)}px`,
                          height: "360px",
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartRows}
                            barCategoryGap="0%"
                            barGap={3}
                            margin={{ top: 20, right: 20, left: 5, bottom: 45 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                            />

                            <XAxis
                              dataKey="chartLabel"
                              angle={-35}
                              textAnchor="end"
                              interval={0}
                              height={70}
                              tick={{ fontSize: 11 }}
                            />

                            <YAxis
                              tick={{ fontSize: 11 }}
                              tickFormatter={(value) => `${value}${indicatorUnit}`}
                            />

                            <Tooltip
                              formatter={(value, name) => [
                                `${value}${indicatorUnit}`,
                                `${name} — ${indicatorLabel}`,
                              ]}
                              labelFormatter={(label) => `State: ${label}`}
                            />

                            <Legend />

                            {chartYears.map((year, index) => {
                              const yearColors = ["#0B3C5D", "#1F7A3F", "#D6A756"];

                              return (
                                <Bar
                                  key={year}
                                  dataKey={String(year)}
                                  name={String(year)}
                                  fill={yearColors[index % yearColors.length]}
                                  barSize={15}
                                  maxBarSize={18}
                                  radius={[3, 3, 0, 0]}
                                />
                              );
                            })}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* TRANSPARENCY */}
                <div className="mt-8 rounded-lg bg-[#E7ECEF] p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-[#0B3C5D]">
                      <span className="text-[#1F7A3F]">✓</span>
                      DATA TRANSPARENCY
                    </h3>

                    <span className="rounded-full bg-[#C5D2D9] px-2 py-1 text-[9px] font-semibold text-[#0B3C5D]">
                      {appliedFilters && filteredGovernanceRecords.length > 0
                        ? "Published data"
                        : "Awaiting filter selection"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 text-[10px] leading-5 text-gray-500 sm:grid-cols-2">
                    <p>
                      <strong className="text-[#0B3C5D]">Sector:</strong>{" "}
                      Governance
                    </p>

                    <p>
                      <strong className="text-[#0B3C5D]">Reporting states:</strong>{" "}
                      {appliedFilters
                        ? `${transparencyStats.reportingStates} states`
                        : "Awaiting filter selection"}
                    </p>

                    <p>
                      <strong className="text-[#0B3C5D]">Reporting years:</strong>{" "}
                      {appliedFilters && transparencyStats.reportingYears.length > 0
                        ? transparencyStats.reportingYears.join(", ")
                        : "Awaiting filter selection"}
                    </p>

                    <p>
                      <strong className="text-[#0B3C5D]">Published records:</strong>{" "}
                      {appliedFilters
                        ? transparencyStats.recordCount
                        : "Awaiting filter selection"}
                    </p>
                  </div>

                </div>
              </div>

              {/* ANALYSIS PANEL */}
              <aside className="min-w-0 space-y-7">

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-sm bg-[#E7ECEF] px-2 py-1 text-[10px] font-medium text-[#0B3C5D]">
                      Analysis Brief
                    </span>

                    <span className="text-[10px] text-white/50">
                      {transparencyStats.reportingYears.length > 0
                        ? `Reporting period: ${transparencyStats.reportingYears[0]}${
                            transparencyStats.reportingYears.length > 1
                              ? `–${transparencyStats.reportingYears[transparencyStats.reportingYears.length - 1]}`
                              : ""
                          }`
                        : "Awaiting data"}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-bold leading-snug sm:text-2xl">
                    {indicatorLabel}

                    <span className="block text-white/90">
                      State-level analysis
                    </span>
                  </h2>
                </div>

                <div className="space-y-5 border-t border-white/15 pt-5">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">
                      Overview
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-white/65">
                      This analysis examines published {indicatorLabel.toLowerCase()} records
                      from {transparencyStats.reportingStates}{" "}
                      {transparencyStats.reportingStates === 1 ? "state" : "states"} with valid numeric values.

                      {transparencyStats.recordCount > 0 &&
                        ` The selected filters returned ${transparencyStats.recordCount} published records.`}

                      {transparencyStats.reportingYears.length > 0 && (
                        <>
                          The available records span{" "}
                          {transparencyStats.reportingYears.length === 1
                            ? transparencyStats.reportingYears[0]
                            : `${transparencyStats.reportingYears[0]}–${
                                transparencyStats.reportingYears[
                                  transparencyStats.reportingYears.length - 1
                                ]
                              }`}.
                        </>
                      )}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[10px] text-white/50">
                          States represented
                        </p>

                        <p className="mt-1 text-xl font-bold text-white">
                         {transparencyStats.reportingStates}
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[10px] text-white/50">
                          Reporting period
                        </p>

                        <p className="mt-1 text-xl font-bold text-white">
                          {transparencyStats.reportingYears.length > 0
                            ? `${transparencyStats.reportingYears[0]}${
                                transparencyStats.reportingYears.length > 1
                                  ? `–${transparencyStats.reportingYears[transparencyStats.reportingYears.length - 1]}`
                                  : ""
                              }`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* KEY FINDINGS */}
                  <div className=" border-white/15 pt-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">
                      Key Findings
                    </h3>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[10px] text-white/50">
                          Highest reported value
                        </p>

                        <p className="mt-2 text-lg font-bold text-white">
                          {highestRecord
                            ? `${highestRecord.numericValue.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}${indicatorUnit === "%" ? "%" : indicatorUnit ? ` ${indicatorUnit}` : ""}`
                            : "—"}
                        </p>

                        <p className="mt-1 text-xs text-white/60">
                          {highestRecord
                            ? `${highestRecord.state} · ${highestRecord.year}`
                            : "Awaiting data"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[10px] text-white/50">
                          Lowest reported value
                        </p>

                        <p className="mt-2 text-lg font-bold text-white">
                          {lowestRecord
                            ? `${lowestRecord.numericValue.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}${indicatorUnit === "%" ? "%" : indicatorUnit ? ` ${indicatorUnit}` : ""}`
                            : "—"}
                        </p>

                        <p className="mt-1 text-xs text-white/60">
                          {lowestRecord
                            ? `${lowestRecord.state} · ${lowestRecord.year}`
                            : "Awaiting data"}
                        </p>
                      </div>
                    </div>

                    {valueDifference !== null && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                        Difference between reported values
                      </p>

                      <p className="mt-2 text-lg font-bold text-white">
                        {valueDifference.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                        {indicatorUnit === "%"
                          ? " percentage points"
                          : indicatorUnit
                            ? ` ${indicatorUnit}`
                            : ""}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-white/60">
                        The highest reported value is from {highestRecord.state} ({highestRecord.year}),
                        while the lowest is from {lowestRecord.state} ({lowestRecord.year}).
                        This difference describes the spread in the selected records,
                        not a performance ranking.
                      </p>
                    </div>
                  )}

                  <p className="mt-3 text-[10px] leading-5 text-white/45">
                    Findings are based on published Governance records matching the selected filters.
                    They describe reported values and do not independently establish governance performance.
                  </p>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    disabled
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white opacity-50"
                  >
                    <span>Share report</span>
                    <Share2 size={18} />
                  </button>

                  <div className="relative w-full">
                    <button
                      type="button"
                      onClick={() =>
                        setExportOpen((previous) => !previous)
                      }
                      disabled
                      aria-label="Choose export format"
                      aria-expanded={exportOpen}
                      className="flex w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-5 py-3 text-sm font-semibold text-white opacity-50"
                    >
                      Export
                      <ChevronDown size={18} />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="flex w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-5 py-3 text-sm font-semibold text-white opacity-50"
                  >
                    Save indicator
                  </button>

                  <p className="text-center text-[10px] leading-5 text-white/45">
                    Sharing, exporting and saving will be enabled
                    when Governance records are available.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </motion.div>
      </section>

      {/* LATEST GOVERNANCE RELEASES */}
      <section className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionHeading>
              LATEST GOVERNANCE RELEASES
            </SectionHeading>

            <button
              type="button"
              onClick={() => navigate("/media")}
              className="mb-6 text-xs font-semibold text-[#1F7A3F] transition-colors hover:underline"
            >
              View all releases →
            </button>
          </div>

          <div id="governance-releases">
            {mediaLoading ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Loading Governance releases...
              </p>
            ) : mediaError ? (
              <p className="py-6 text-center text-sm text-red-600">
                {mediaError}
              </p>
            ) : governanceMedia.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
                <h3 className="text-base font-semibold text-[#0B3C5D]">
                  No Governance releases yet
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Governance reports and publications will appear
                  here when they are added to CivicIntel Media.
                </p>
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {governanceMedia.map((release) => (
                  <Link
                    to={`/media/${release.id}`}
                    key={release.id}
                    className="block"
                  >
                    <motion.article
                      variants={revealVariants}
                      className="group h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-[0.99]"
                    >
                      <div className="overflow-hidden">
                        <img
                          src={
                            release.image_url
                              ? `https://backend-production-91cb.up.railway.app${release.image_url}`
                              : governanceHero
                          }
                          alt={release.title || "Governance report"}
                          loading="lazy"
                          className="h-48 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      </div>

                      <div className="p-4">
                        <p className="text-[10px] text-gray-500">
                          {release.category || "Governance"}
                        </p>

                        <h3 className="mt-3 text-sm font-semibold leading-6">
                          {release.title}
                        </h3>
                      </div>
                    </motion.article>
                  </Link>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Governance;
