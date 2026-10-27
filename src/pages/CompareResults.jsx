
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Save } from "lucide-react";

import { exportData } from "../utility/exportData.js";
import { useAuth } from "../context/AuthContext.jsx";

// --------------------------------------------------
// Validate comparison selections
// --------------------------------------------------

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
    indicator: value.indicator.trim(),
    selectedStates: [...new Set(validStates)],
    fromYear,
    toYear,
  };
}

// --------------------------------------------------
// Prepare export data
//
// Current behavior:
// Export comparison settings only.
//
// Future behavior:
// Pass records returned by the backend into this function.
// The same export utility can then export actual API records.
// --------------------------------------------------

function buildExportContent(comparison, records = null) {
  const hasRecords =
    Array.isArray(records) && records.length > 0;

  const headers = hasRecords
    ? Object.keys(records[0])
    : ["Field", "Value"];

  const rows = hasRecords
    ? records
    : [
        {
          Field: "Report type",
          Value: "CivicIntel comparison",
        },
        {
          Field: "Data status",
          Value: "Configuration preview - API data not connected",
        },
        {
          Field: "Domain",
          Value: comparison.domain,
        },
        {
          Field: "Indicator",
          Value: comparison.indicator,
        },
        {
          Field: "Selected states",
          Value:
            comparison.selectedStates.join(", ") ||
            "None selected",
        },
        {
          Field: "From year",
          Value: comparison.fromYear,
        },
        {
          Field: "To year",
          Value: comparison.toYear,
        },
        {
          Field: "Note",
          Value:
            "This is a configuration preview. It contains no verified indicator values, trends, rankings, or statistical findings.",
        },
      ];

  return {
    headers,
    rows,
    hasRecords,
  };
}

// --------------------------------------------------
// Export comparison
//
// records and sourceMetadata are optional.
// Pass real API records and metadata when integrated.
// --------------------------------------------------

function exportComparison(
  comparison,
  format,
  records = null,
  sourceMetadata = {}
) {
  if (!comparison) {
    throw new Error(
      "No valid comparison is available to export."
    );
  }

  const { headers, rows, hasRecords } =
    buildExportContent(comparison, records);

  const safeDomain = comparison.domain.toLowerCase();

  const normalizedFormat =
    format.toLowerCase() === "excel"
      ? "xlsx"
      : format.toLowerCase();

  const metadata = {
    "Report type": "CivicIntel comparison",
    Domain: comparison.domain,
    Indicator: comparison.indicator,
    "Selected states":
      comparison.selectedStates.join(", ") ||
      "None selected",
    "From year": comparison.fromYear,
    "To year": comparison.toYear,
    "Data status": hasRecords
      ? sourceMetadata.dataStatus ||
        "Records supplied by the data service; verification status must be confirmed"
      : "Configuration preview - verified results not connected",
    ...sourceMetadata,
  };

  exportData({
    format: normalizedFormat,
    headers,
    rows,
    fileName: `civicintel-${safeDomain}-comparison`,
    title: "CivicIntel - Comparison Report",
    subtitle: `${comparison.domain} | ${comparison.indicator}`,
    metadata,
    landscape: true,
  });

  return hasRecords;
}

// --------------------------------------------------
// Chart placeholder
// --------------------------------------------------

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

// --------------------------------------------------
// Data provenance placeholder
// --------------------------------------------------

function ProvenancePlaceholder() {
  return (
    <section className="mt-5 rounded-lg bg-[#E8EEF1] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-bold text-[#0B3C5D] sm:text-sm">
          DATA PROVENANCE RECORD
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

// --------------------------------------------------
// Analysis brief
// --------------------------------------------------

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

// --------------------------------------------------
// Facility placeholder
// --------------------------------------------------

function FacilityPlaceholder() {
  return (
    <section className="mt-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">
          Facility Spot Check
        </h2>

        
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        Facility locations and audit points will be displayed here
        when a verified map or facility service is connected.
      </p>

      <div className="mt-3 flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-[#E8EEF1] p-5 text-center">
        <span className="text-2xl text-[#1F7A3F]" aria-hidden="true">
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

// --------------------------------------------------
// Main CompareResults page
// --------------------------------------------------

function CompareResults() {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const comparison = useMemo(
    () => getValidComparison(location.state?.comparison),
    [location.state?.comparison]
  );

  const [notice, setNotice] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Keep login protection.
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

  // Export current comparison settings.
  //
  // When the backend is integrated, pass the returned API records
  // and their real provenance metadata into exportComparison().
  const handleExport = (format) => {
    setShowExportMenu(false);
    setNotice("");

    if (!comparison) {
      setNotice(
        "No valid comparison is available to export. Return to Explore and configure a comparison."
      );
      return;
    }

    try {
      const hasRecords = exportComparison(
        comparison,
        format
      );

      setNotice(
        hasRecords
          ? `${format} export generated successfully.`
          : `${format} file generated. It contains your comparison settings only, not verified indicator results.`
      );
    } catch (error) {
      console.error("Comparison export failed:", error);

      setNotice(
        error instanceof Error
          ? error.message
          : `The ${format} export could not be generated.`
      );
    }
  };

  // Placeholder until the backend save-report endpoint is available.
  const handleSave = () => {
    setNotice(
      "Saving reports to your account is not connected yet. This feature will be enabled when the backend save-report endpoint is available."
    );
  };

  return (
    <div className="min-h-screen bg-[#E7ECEF] pt-18">
      <main className="mx-auto max-w-7xl px-4 pb-8 pt-18 sm:px-8 sm:pt-14 lg:px-10">
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
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(280px,0.9fr)] lg:gap-10">
            <div className="min-w-0">
              <div className="overflow-hidden bg-white shadow-sm">
                <ChartPlaceholder />

                <div className="p-4 pt-0 sm:p-5 sm:pt-0">
                  <ProvenancePlaceholder />
                </div>
              </div>
            </div>

            <aside className="min-w-0">
              <AnalysisBrief comparison={comparison} />

              {/* Export menu */}
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
                  

                  <span>Export</span>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className={`h-4 w-4 transition-transform duration-200 ${
                      showExportMenu ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m6 9 6 6 6-6"
                    />
                  </svg>
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
                        className="block w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50 focus-visible:bg-slate-50"
                      >
                        Export as {format}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Save comparison */}
              <button
                type="button"
                onClick={handleSave}
                className="mt-2 flex w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#176332] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A3F]"
              >
                Save comparison

                <Download
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
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
        )}

        {/* Back Home */}
        <div className="mt-8 flex justify-center sm:mt-10">
          <Link
            to="/"
            className="flex w-full max-w-md items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#176332]"
          >
            Back Home

            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white p-1 text-[#0B3C5D] shadow-md shadow-black/20"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.span>
          </Link>
        </div>

        {/* Edit comparison */}
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
            className="text-xs font-medium text-[#0B3C5D] hover:text-[#1F7A3F]"
          >
            Edit comparison selections
          </Link>
        </div>
      </main>
    </div>
  );
}

export default CompareResults;
