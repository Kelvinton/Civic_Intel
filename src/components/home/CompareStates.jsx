
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

// Handles both direct API responses and responses wrapped in data.
function unwrapOptions(payload) {
  return payload?.data?.data ?? payload?.data ?? payload;
}

function CompareStates() {
  const navigate = useNavigate();
  const { isLoggedIn, loading } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const motionSettings = useMotionSettings();

  const [indicators, setIndicators] = useState([]);
  const [states, setStates] = useState([]);
  // const [domains, setDomains] = useState([]);

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  const [indicator, setIndicator] = useState("");
  const [primaryState, setPrimaryState] = useState("");
  const [comparisonState, setComparisonState] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  // Fetch comparison options from the backend.
  useEffect(() => {
  let isMounted = true;

  async function loadCompareOptions() {
    setOptionsLoading(true);
    setOptionsError("");

    try {
      const [indicatorsResponse, statesResponse] =
        await Promise.all([
          getIndicators(),
          getStates(),
        ]);

      const indicatorsData = unwrapOptions(indicatorsResponse);
      const statesData = unwrapOptions(statesResponse);

      if (!isMounted) return;

      setIndicators(
        Array.isArray(indicatorsData)
          ? indicatorsData
          : Array.isArray(indicatorsData?.indicators)
            ? indicatorsData.indicators
            : []
      );

      setStates(
        Array.isArray(statesData)
          ? statesData
          : Array.isArray(statesData?.states)
            ? statesData.states
            : []
      );

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

  // Get the available years for the selected indicator.
  const selectedIndicator = indicators.find(
    (item) => item.key === indicator
  );

  const years = Array.isArray(selectedIndicator?.years)
    ? [...new Set(selectedIndicator.years)]
        .filter(
          (item) =>
            Number.isInteger(Number(item)) &&
            Number(item) >= 1900 &&
            Number(item) <= 2100
        )
        .sort((a, b) => Number(b) - Number(a))
    : [];

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
      ...(year
        ? {
            year,
            fromYear: year,
            toYear: year,
          }
        : {}),
    };

    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: {
            pathname: "/compare-results",
          },
          comparison,
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
              {optionsError}
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
                setYear("");
                setError("");
              }}
              className={selectClass}
              disabled={optionsLoading || indicators.length === 0}
              required
            >
              <option value="">Select an indicator</option>

              {indicators.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.name}
                </option>
              ))}
            </select>

            {!optionsLoading &&
            !optionsError &&
            indicators.length === 0 && (
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
                    {state.name} — {state.zone || "Zone unavailable"}
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
                    {state.name} — {state.zone || "Zone unavailable"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="year"
              className="block text-xs font-medium"
            >
              Year 
            </label>

            <input
              id="year"
              type="number"
              value={year}
              onChange={(event) => {
                setYear(event.target.value);
                setError("");
              }}
              placeholder="Enter year (e.g. 2023)"
              min="1900"
              max="2100"
              className={selectClass}
              disabled={!indicator}
            />

           
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
