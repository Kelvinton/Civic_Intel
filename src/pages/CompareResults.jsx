
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function getValidComparison(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const validDomains = ["Health", "Education"];

  const validStates = Array.isArray(value.selectedStates)
    ? value.selectedStates.filter(
        (state) => typeof state === "string"
      )
    : [];

  const fromYear = String(value.fromYear ?? "");
  const toYear = String(value.toYear ?? "");

  if (
    !validDomains.includes(value.domain) ||
    typeof value.indicator !== "string" ||
    !value.indicator.trim() ||
    !/^\d{4}$/.test(fromYear) ||
    !/^\d{4}$/.test(toYear) ||
    Number(fromYear) > Number(toYear)
  ) {
    return null;
  }

  return {
    domain: value.domain,
    indicator: value.indicator,
    selectedStates: [...new Set(validStates)],
    fromYear,
    toYear,
  };
}

function ChartPlaceholder() {
  return (
    <div className="relative min-w-0 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 sm:text-base">
            Comparison across selected states
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Your indicator chart will appear here when data is connected.
          </p>
        </div>

        <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-medium text-amber-800">
          Awaiting data
        </span>
      </div>

      <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] gap-3">
        <div className="flex flex-col justify-between pb-7 pt-1 text-[10px] text-slate-400">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        <div className="relative min-w-0">
          <div className="absolute inset-0 bottom-7 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((line) => (
              <div
                key={line}
                className="border-t border-dashed border-slate-200"
              />
            ))}
          </div>

          <div className="relative flex h-64 items-end justify-around gap-2 sm:h-72">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex h-full min-w-0 flex-1 flex-col justify-end"
              >
                <div
                  className="flex h-[72%] items-center justify-center rounded-t-md border border-dashed border-slate-300 bg-slate-100/70"
                  title="Chart data will be supplied by the API"
                >
                  <span className="hidden text-[10px] text-slate-400 sm:inline">
                    No data
                  </span>
                </div>

                <div className="mt-2 truncate text-center text-[9px] text-slate-500 sm:text-xs">
                  State {item + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
        This is a layout preview only. No state values, national averages,
        trends, or rankings are being reported yet.
      </div>
    </div>
  );
}

function ProvenancePlaceholder() {
  return (
    <section className="mt-5 rounded-lg bg-[#E8EEF1] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-bold text-[#0B3C5D] sm:text-sm">
          ✓ DATA PROVENANCE RECORD
        </h3>

        <span className="rounded-full bg-[#C6D6E0] px-2 py-1 text-[10px] text-[#0B3C5D]">
          Pending integration
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
        <p>
          <span className="font-medium text-[#0B3C5D]">
            Primary source:
          </span>{" "}
          To be supplied by the connected data service
        </p>

        <p>
          <span className="font-medium text-[#0B3C5D]">
            Data vintage:
          </span>{" "}
          Not available yet
        </p>

        <p>
          <span className="font-medium text-[#0B3C5D]">
            Audit status:
          </span>{" "}
          Awaiting source metadata
        </p>

        <p>
          <span className="font-medium text-[#0B3C5D]">
            License:
          </span>{" "}
          To be confirmed from the source
        </p>
      </div>

      <p className="mt-4 text-[10px] italic leading-relaxed text-slate-500">
        Source details, audit records, release dates, and licensing
        information will be populated from verified metadata.
      </p>
    </section>
  );
}

function AnalysisBrief({ comparison }) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-medium text-[#0B3C5D]">
          Analysis Brief
        </span>

        <span className="text-[10px] text-slate-500">
          Data not connected
        </span>
      </div>

      <h2 className="mt-2 text-lg font-bold leading-snug text-slate-900">
        {comparison.domain} Indicator Comparison
      </h2>

      <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
        This overview will summarize the selected indicator once the
        comparison data is available. No conclusions about state
        performance can be made before the data is loaded.
      </p>

      <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-xs">
        <div className="flex items-start justify-between gap-3">
          <span className="text-slate-500">Indicator</span>

          <span className="max-w-[65%] break-words text-right font-medium text-slate-700">
            {comparison.indicator}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <span className="text-slate-500">Selected states</span>

          <span className="max-w-[65%] break-words text-right font-medium text-slate-700">
            {comparison.selectedStates.length
              ? comparison.selectedStates.join(", ")
              : "None selected"}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <span className="text-slate-500">Year range</span>

          <span className="text-right font-medium text-slate-700">
            {comparison.fromYear}–{comparison.toYear}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-3">
        <p className="text-xs font-medium text-[#0B3C5D]">
          Overview and key findings
        </p>

        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Summary statistics, national benchmarks, regional gaps, and
          insights will appear here after API integration.
        </p>
      </div>
    </section>
  );
}

function FacilityPlaceholder() {
  return (
    <section className="mt-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">
          Facility Spot Check
        </h2>

        <span
          aria-hidden="true"
          className="text-lg text-[#1F7A3F]"
        >
          ◎
        </span>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        Facility locations and audit points will be displayed here
        when a verified map or facility service is connected.
      </p>

      <div className="mt-3 flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-[#E8EEF1] p-5 text-center">
        <span
          className="text-2xl text-[#1F7A3F]"
          aria-hidden="true"
        >
          ◎
        </span>

        <p className="mt-2 text-sm font-semibold text-[#0B3C5D]">
          Map integration pending
        </p>

        <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
          Facility coordinates, coverage, and registration totals will
          be shown when verified location data becomes available.
        </p>
      </div>
    </section>
  );
}

function CompareResults() {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const comparison = getValidComparison(
    location.state?.comparison
  );

  const [notice, setNotice] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    if (loading || isLoggedIn) {
      return;
    }

    navigate("/login", {
      replace: true,
      state: {
        from: { pathname: "/explore" },
        exploreDraft: comparison
          ? {
              domain: comparison.domain,
              indicator: comparison.indicator,
              selectedStates: comparison.selectedStates,
              fromYear: comparison.fromYear,
              toYear: comparison.toYear,
            }
          : undefined,
        message: comparison
          ? "Log in to access your comparison results. Your selections will be kept."
          : "Log in to access comparison results.",
      },
    });
  }, [isLoggedIn, loading, navigate, comparison]);

  if (loading || !isLoggedIn) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-[#E7ECEF] px-4">
        <p className="text-sm text-[#0B3C5D]">
          Checking your sign-in status…
        </p>
      </main>
    );
  }

  const handleExport = (format) => {
    setShowExportMenu(false);

    setNotice(
      `${format} export will be available when the comparison data service is connected.`
    );
  };

  const handleSave = () => {
    setNotice(
      "Save functionality will be available when saved comparisons are connected to your account."
    );
  };

  return (
    <div className="min-h-screen bg-[#E7ECEF]">
      <main className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-8 sm:pt-14 lg:px-10">
        
        <header className="relative z-10 mb-8 block w-full px-2 pt-2 text-center sm:mb-10 sm:px-0 sm:pt-0">
        <h1 className="block text-3xl font-bold leading-tight tracking-tight text-[#0B3C5D] sm:text-4xl lg:text-5xl">
            Data Generated
        </h1>

        <p className="mx-auto mt-3 block max-w-xl text-sm leading-relaxed text-slate-700">
            Here is an overview of your comparison setup.
        </p>
        </header>


        {!comparison && (
          <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            No valid comparison selections were received. Return to
            Explore to configure a new comparison.
          </div>
        )}

        {comparison && (
          <>
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(280px,0.9fr)] lg:gap-10">
              {/* CHART AND DATA PROVENANCE */}
              <div className="min-w-0">
                <div className="overflow-hidden bg-white shadow-sm">
                  <ChartPlaceholder /> 

                  <div className="p-4 pt-0 sm:p-5 sm:pt-0">
                    <ProvenancePlaceholder />
                  </div>
                </div>
              </div>

              {/* ANALYSIS, EXPORT, SAVE AND FACILITY CHECK */}
              <aside className="min-w-0">
                <AnalysisBrief comparison={comparison} />

                <div className="relative mt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setShowExportMenu((previous) => !previous)
                    }
                    aria-expanded={showExportMenu}
                    aria-controls="comparison-export-menu"
                    className="flex w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#176332] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A3F]"
                  >
                    Export
                    <span aria-hidden="true">⌄</span>
                  </button>

                  {showExportMenu && (
                    <div
                      id="comparison-export-menu"
                      className="absolute left-0 right-0 z-10 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                    >
                      {["CSV", "Excel", "PDF"].map((format) => (
                        <button
                          key={format}
                          type="button"
                          onClick={() => handleExport(format)}
                          className="block w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50"
                        >
                          Export as {format}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className="mt-2 flex w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#176332] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A3F]"
                >
                  Save comparison
                  <span aria-hidden="true">↓</span>
                </button>

                {notice && (
                  <div
                    role="status"
                    className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900"
                  >
                    {notice}
                  </div>
                )}

                <FacilityPlaceholder />
              </aside>
            </div>
          </>
        )}

        <div className="mt-8 flex justify-center sm:mt-10">
          <Link
            to="/"
            className="flex w-full max-w-md items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#176332]"
          >
            Back Home

            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#1F7A3F]">
              →
            </span>
          </Link>
        </div>

        <div className="mt-5 text-center">
          <Link
            to="/explore"
            state={{
              exploreDraft: comparison
                ? {
                    domain: comparison.domain,
                    indicator: comparison.indicator,
                    selectedStates: comparison.selectedStates,
                    fromYear: comparison.fromYear,
                    toYear: comparison.toYear,
                  }
                : undefined,
            }}
            className="text-xs font-medium text-[#0B3C5D] underline underline-offset-4 hover:text-[#1F7A3F]"
          >
            Edit comparison selections
          </Link>
        </div>
      </main>
    </div>
  );
}

export default CompareResults;
