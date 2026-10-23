
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const indicators = [
  "Maternal health coverage",
  "Maternal mortality ratio",
  "Primary school completion",
  "Out-of-school children",
  "Healthcare facility density",
  "Education expenditure",
];

const states = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi",
  "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara",
  "Federal Capital Territory",
];

const years = [
  "2026", "2025", "2024", "2023", "2022", "2021", "2020",
];

function CompareStates() {
  const navigate = useNavigate();
  const { isLoggedIn, loading } = useAuth();

  const [indicator, setIndicator] = useState("");
  const [primaryState, setPrimaryState] = useState("");
  const [comparisonState, setComparisonState] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  const selectClass =
    "mt-2 h-11 w-full rounded-xl border border-transparent bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#1F7A3F] focus:ring-2 focus:ring-[#1F7A3F]/30";

  function handleCompare(event) {
    event.preventDefault();
    setError("");

    // 1. Validate the selections.
    if (!indicator || !primaryState || !comparisonState || !year) {
      setError(
        "Please select an indicator, both states, and a year."
      );
      return;
    }

    // 2. Prevent comparing a state with itself.
    if (primaryState === comparisonState) {
      setError("Please choose two different states to compare.");
      return;
    }

    // 3. Wait until the authentication status is known.
    if (loading) {
      setError(
        "Checking your sign-in status. Please try again shortly."
      );
      return;
    }

    // 4. Package the comparison selections.
    const comparison = {
      indicator,
      primaryState,
      comparisonState,
      year,
    };

    // 5. Redirect logged-out users to login.
    // Preserve the comparison so the user can continue after login.
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

    // 6. Logged-in users go directly to the comparison results.
    navigate("/compare-results", {
      state: {
        comparison: {
          ...comparison,

          // Supply the fields expected by the Explore comparison page,
          // if those fields are needed elsewhere later.
          selectedStates: [primaryState, comparisonState],
          fromYear: year,
          toYear: year,
        },
      },
    });
  }

  return (
    <section
      id="compare-states"
      className="bg-gray-200 px-5 py-10 sm:px-8 sm:py-14 lg:px-20"
    >
      <div className="mx-auto max-w-6xl">
        <form
          onSubmit={handleCompare}
          className="rounded-2xl bg-[#0B3C5D] px-5 py-7 text-white sm:px-8 sm:py-9 lg:px-10"
        >
          <h2 className="text-lg font-semibold sm:text-xl">
            Compare States
          </h2>

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
              onChange={(event) => setIndicator(event.target.value)}
              className={selectClass}
              required
            >
              <option value="">Select an indicator</option>

              {indicators.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
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
                onChange={(event) =>
                  setPrimaryState(event.target.value)
                }
                className={selectClass}
                required
              >
                <option value="">Select primary state</option>

                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
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
                onChange={(event) =>
                  setComparisonState(event.target.value)
                }
                className={selectClass}
                required
              >
                <option value="">Select comparison state</option>

                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
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

            <select
              id="year"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className={selectClass}
              required
            >
              <option value="">Select year</option>

              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 text-sm text-red-200"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-5 text-sm text-white transition-colors hover:bg-[#176331] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? "Checking sign-in..." : "Compare"}

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
          </button>

          {!isLoggedIn && !loading && (
            <p className="mt-3 text-center text-xs text-white/75">
              Sign in is required to view your comparison results.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

export default CompareStates;
