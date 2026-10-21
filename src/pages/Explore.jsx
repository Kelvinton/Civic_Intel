
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Explore() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const comparison = location.state?.comparison;

  function handleNewComparison() {
    navigate("/", {
      state: { scrollToComparison: true },
    });
  }

  return (
    <main className="min-h-screen bg-[#E7ECEF] px-5 py-12 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#1F7A3F]">
            CivicIntel Data Explorer
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#0B3C5D] sm:text-4xl">
            Explore Nigerian Data
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Explore health, education, and governance indicators
            across Nigerian states.
          </p>
        </header>

        {comparison ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-xl font-semibold text-[#0B3C5D]">
                  Your State Comparison
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Review your selected comparison below.
                </p>
              </div>

              <span className="w-fit rounded-full bg-[#1F7A3F]/10 px-3 py-1 text-xs font-semibold text-[#1F7A3F]">
                {comparison.year}
              </span>
            </div>

            <div className="mt-6 rounded-xl bg-[#F3F6F7] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Selected indicator
              </p>

              <p className="mt-2 font-semibold text-[#0B3C5D]">
                {comparison.indicator}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500">Primary state</p>
                <h3 className="mt-2 text-xl font-bold text-[#0B3C5D]">
                  {comparison.primaryState}
                </h3>
              </div>

              <div className="rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500">Comparison state</p>
                <h3 className="mt-2 text-xl font-bold text-[#0B3C5D]">
                  {comparison.comparisonState}
                </h3>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-6 text-center">
              <h3 className="font-semibold text-[#0B3C5D]">
                Comparison results will appear here
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
                The selected states and indicator are ready. Actual
                figures, charts, and differences will appear when the
                backend data integration is connected.
              </p>
            </div>

            <button
              type="button"
              onClick={handleNewComparison}
              className="mt-6 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176331] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A3F]"
            >
              Start a New Comparison
            </button>
          </section>
        ) : (
          <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-[#0B3C5D]">
              Start exploring
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
              {isLoggedIn
                ? "You are signed in. Choose a data comparison or explore the available platform sections."
                : "Browse the public platform sections. Log in when you want to compare states or access protected analysis tools."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-6 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176331]"
            >
              Return Home
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

export default Explore;
