
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import {
  revealVariants,
  useMotionSettings,
} from "../../animation.js";

import { useAuth } from "../../context/AuthContext.jsx";
import {
  getIndicators,
  getStates,
} from "../../api/referenceData.js";

import { getAllPublishedRecords } from "../../api/publishedData.js";

// Handles both direct API responses and responses wrapped in data.
function unwrapList(payload, key) {
  const data = payload?.data?.data ?? payload?.data ?? payload;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.items)) return data.items;

  return [];
}

function CompareStates() {
  const navigate = useNavigate();
  const { isLoggedIn, loading } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const motionSettings = useMotionSettings();

  const [indicators, setIndicators] = useState([]);
  const [states, setStates] = useState([]);
  const [publishedRecords, setPublishedRecords] = useState([]);
  // const [domains, setDomains] = useState([]);

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  const [indicator, setIndicator] = useState("");
  const [primaryState, setPrimaryState] = useState("");
  const [comparisonState, setComparisonState] = useState("");
  const [selectedYears, setSelectedYears] = useState([]);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [error, setError] = useState("");

  // Fetch comparison options from the backend.
  useEffect(() => {
  let isMounted = true;

  async function loadCompareOptions() {
    setOptionsLoading(true);
    setOptionsError("");

    try {
      const [
        indicatorsResponse,
        statesResponse,
        demographicsRecords,
        healthRecords,
        financeRecords,
        educationRecords,
      ] = await Promise.all([
        getIndicators(),
        getStates(),
        getAllPublishedRecords({ sector: "demographics" }),
        getAllPublishedRecords({ sector: "health" }),
        getAllPublishedRecords({ sector: "finance" }),
        getAllPublishedRecords({ sector: "education" }),
      ]);

      if (!isMounted) return;

      const backendIndicators = unwrapList(
        indicatorsResponse,
        "indicators"
      );

      const backendStates = unwrapList(
        statesResponse,
        "states"
      );

      setIndicators(backendIndicators);
      setStates(backendStates);

      setPublishedRecords([
        ...demographicsRecords,
        ...healthRecords,
        ...financeRecords,
        ...educationRecords,
      ]);


    } catch (err) {
      if (!isMounted) return;

      setOptionsError(
        err.message || "Unable to load comparison options."
      );
    } finally {
      if (isMounted) {
        setOptionsLoading(false);
      }
    }
  }

  loadCompareOptions();

  return () => {
    isMounted = false;
  };
}, []);

  // Display all indicators returned by the backend.
  const availableIndicators = indicators;

  const selectedIndicator = availableIndicators.find(
    (item) => item.key === indicator
  );

  // Get the years available for the selected indicator.
  const availableYears = [
  ...new Set(
    publishedRecords
      .filter((record) => record.indicator_key === indicator)
      .map((record) => Number(record.year))
      .filter(
        (year) =>
          Number.isInteger(year) &&
          year >= 1900 &&
          year <= 2100
      )
  ),
].sort((a, b) => a - b);

  // Add or remove an individual year.
  function toggleYear(year) {
    setError("");

    setSelectedYears((previous) => {
      if (previous.includes(year)) {
        return previous.filter((item) => item !== year);
      }

      if (previous.length >= 30) {
        setError(
          "You can select a maximum of 30 years per comparison."
        );

        return previous;
      }

      return [...previous, year].sort((a, b) => a - b);
    });
  }

  const selectClass =
    "mt-2 h-11 w-full rounded-xl border border-transparent bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#1F7A3F] focus:ring-2 focus:ring-[#1F7A3F]/30 disabled:cursor-not-allowed disabled:opacity-60";

  function handleCompare(event) {
    event.preventDefault();
    setError("");

    if (!indicator || !primaryState || !comparisonState) {
      setError(
        "Please select an indicator and both states."
      );
      return;
    }

    if (primaryState === comparisonState) {
      setError("Please choose two different states to compare.");
      return;
    }

    if (loading) {
      setError(
        "Checking your sign-in status. Please try again shortly."
      );
      return;
    }

    const comparison = {
      indicator,
      indicatorName: selectedIndicator?.name || "",
      primaryState,
      comparisonState,
      selectedStates: [primaryState, comparisonState],

      // An empty array means no specific years were selected.
      // The results page can then use all available years.
      selectedYears,
    };

    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: {
            pathname: "/compare-results",
            state: {
              comparison,
            },
          },
          message:
            "Please log in to view your state comparison. Your selections will be kept.",
        },
      });

      return;
    }

    navigate("/compare-results", {
      state: {
        comparison,
      },
    });
  }

  return (
    <section
      id="compare-states"
      className="bg-gray-200 px-5 py-10 sm:px-8 sm:py-14 lg:px-20"
    >
      <div className="mx-auto max-w-6xl">
        {/* Only the form animates */}
        <motion.form
          onSubmit={handleCompare}
          variants={revealVariants}
          {...motionSettings}
          className="rounded-2xl bg-[#0B3C5D] px-5 py-7 text-white sm:px-8 sm:py-9 lg:px-10"
        >
          <h2 className="text-lg font-semibold sm:text-xl">
            Compare States
          </h2>

          {optionsLoading && (
            <p className="mt-4 text-sm text-white/75">
              Loading comparison options...
            </p>
          )}

          {optionsError && (
            <p
              role="alert"
              className="mt-4 text-sm text-red-200"
            >
              {optionsError.toLowerCase().includes("not authenticated")
                ? "Please log in or sign up to use Compare States."
                : optionsError}
            </p>
          )}

          <div className="mt-6">
            <label
              htmlFor="indicator"
              className="block text-xs font-medium"
            >
              Indicator
            </label>

            <select
              id="indicator"
              value={indicator}
             
              onChange={(event) => {
              setIndicator(event.target.value);
              setSelectedYears([]);
              setShowYearDropdown(false);
              setError("");
            }}
              className={selectClass}
              disabled={optionsLoading || indicators.length === 0}
              required
            >
              <option value="">Select an indicator</option>

              {availableIndicators.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.name}
                </option>
              ))}
            </select>

            {!optionsLoading &&
              !optionsError &&
              availableIndicators.length === 0 && (
                <p className="mt-2 text-xs text-amber-200">
                  No comparison indicators are currently available.
                  Please check back when the data has been published.
                </p>
              )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="primary-state"
                className="block text-xs font-medium"
              >
                Primary State
              </label>

              <select
                id="primary-state"
                value={primaryState}
                onChange={(event) => {
                  setPrimaryState(event.target.value);
                  setError("");
                }}
                className={selectClass}
                disabled={optionsLoading || states.length === 0}
                required
              >
                <option value="">Select primary state</option>

                {states.map((state) => (
                  <option key={state.name} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="comparison-state"
                className="block text-xs font-medium"
              >
                Comparison State
              </label>

              <select
                id="comparison-state"
                value={comparisonState}
                onChange={(event) => {
                  setComparisonState(event.target.value);
                  setError("");
                }}
                className={selectClass}
                disabled={optionsLoading || states.length === 0}
                required
              >
                <option value="">Select comparison state</option>

                {states.map((state) => (
                  <option key={state.name} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Multiple year selection */}
          <div className="relative mt-5">
            <label
              htmlFor="year-dropdown"
              className="block text-xs font-medium"
            >
              Select Years
            </label>

            <p className="mt-1 text-xs text-white/70">
              Select multiple years to compare. Only years with
              available data for this indicator are shown.
            </p>

            {/* Dropdown trigger */}
            <button
              id="year-dropdown"
              type="button"
              onClick={() =>
                setShowYearDropdown((previous) => !previous)
              }
              disabled={!indicator || availableYears.length === 0}
              aria-expanded={showYearDropdown}
              aria-controls="year-options"
              className="mt-2 flex h-12 w-full items-center justify-between rounded-xl bg-white px-4 text-left text-sm text-gray-800 outline-none transition hover:ring-2 hover:ring-[#1F7A3F]/30 focus:ring-2 focus:ring-[#1F7A3F]/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {selectedYears.length > 0
                  ? `${selectedYears.length} years selected`
                  : "Select comparison years"}
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
                  showYearDropdown ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown options */}
            {showYearDropdown && (
              <div
                id="year-options"
                className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 text-gray-800 shadow-xl"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-700">
                    Available years
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelectedYears([])}
                    className="text-xs font-medium text-[#1F7A3F] hover:underline"
                  >
                    Clear selection
                  </button>
                </div>

                <div className="space-y-1">
                  {availableYears.map((year) => {
                    const checked = selectedYears.includes(year);

                    return (
                      <label
                        key={year}
                        className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-slate-50"
                      >
                        <span className="text-sm text-slate-700">
                          {year}
                        </span>

                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleYear(year)}
                          className="h-4 w-4 accent-[#1F7A3F]"
                        />
                      </label>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setShowYearDropdown(false)}
                  className="mt-3 w-full rounded-lg bg-[#1F7A3F] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#176331]"
                >
                  Done
                </button>
              </div>
            )}

            {/* Selected years summary */}
            <div className="mt-3">
              {selectedYears.length > 0 ? (
                <p className="text-xs text-white/80">
                  Selected: {selectedYears.join(", ")}
                </p>
              ) : (
                <p className="text-xs text-white/70">
                  No specific years selected. All available years
                  will be used.
                </p>
              )}
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 text-sm text-red-200"
            >
              {error}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={loading || optionsLoading || !!optionsError}
            whileHover={
              shouldReduceMotion || loading || optionsLoading
                ? undefined
                : { scale: 1.02 }
            }
            whileTap={
              shouldReduceMotion || loading || optionsLoading
                ? undefined
                : { scale: 0.98 }
            }
            className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-5 text-sm text-white transition-colors hover:bg-[#176331] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-wait disabled:opacity-70"
          >
            {loading
              ? "Checking sign-in..."
              : optionsLoading
                ? "Loading options..."
                : "Compare"}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12h15m0 0-6.75-6.75M19.5 12l-6.75 6.75"
              />
            </svg>
          </motion.button>

          {!isLoggedIn && !loading && (
            <p className="mt-3 text-center text-xs text-white/75">
              Sign in is required to view your comparison results.
            </p>
          )}
        </motion.form>
      </div>
    </section>
  );
}

export default CompareStates;
