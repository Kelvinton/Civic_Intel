
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

import { exportData } from "../utility/exportData.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getComparison } from "../api/referenceData.js";

// --------------------------------------------------
// Validate comparison selections
// --------------------------------------------------

function getValidComparison(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const selectedStates = Array.isArray(value.selectedStates)
    ? value.selectedStates.filter(
        (state) => typeof state === "string" && state.trim()
      )
    : [value.primaryState, value.comparisonState].filter(
        (state) => typeof state === "string" && state.trim()
      );

  const uniqueStates = [...new Set(selectedStates)];

  const fromYear = String(value.fromYear ?? "");
  const toYear = String(value.toYear ?? "");

  if (
    typeof value.indicator !== "string" ||
    !value.indicator.trim() ||
    uniqueStates.length < 2
  ) {
    return null;
  }

  if (
    (fromYear && !/^\d{4}$/.test(fromYear)) ||
    (toYear && !/^\d{4}$/.test(toYear)) ||
    (fromYear &&
      toYear &&
      Number(fromYear) > Number(toYear))
  ) {
    return null;
  }

  return {
    ...value,
    indicator: value.indicator.trim(),
    selectedStates: uniqueStates,
    fromYear,
    toYear,
    indicatorName:
      value.indicatorName || value.indicator,
    domain: value.domain || "Comparison",
  };
}

// --------------------------------------------------
// Format missing values
// --------------------------------------------------

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat().format(value);
  }

  return value;
}

// --------------------------------------------------
// Prepare export data
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
          Value: "No comparison records returned by the API",
        },
        {
          Field: "Indicator",
          Value: comparison.indicatorName,
        },
        {
          Field: "Indicator key",
          Value: comparison.indicator,
        },
        {
          Field: "Selected states",
          Value: comparison.selectedStates.join(", "),
        },
        {
          Field: "From year",
          Value: comparison.fromYear || "All available years",
        },
        {
          Field: "To year",
          Value: comparison.toYear || "All available years",
        },
        {
          Field: "Note",
          Value:
            "This report contains comparison settings only. No indicator records were returned by the backend.",
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

  const normalizedFormat =
    format.toLowerCase() === "excel"
      ? "xlsx"
      : format.toLowerCase();

  const metadata = {
    "Report type": "CivicIntel comparison",
    Indicator: comparison.indicatorName,
    "Indicator key": comparison.indicator,
    "Selected states": comparison.selectedStates.join(", "),
    "From year": comparison.fromYear || "All available years",
    "To year": comparison.toYear || "All available years",
    "Data status":
      sourceMetadata.dataStatus ||
      (hasRecords
        ? "Data returned by CivicIntel comparison API"
        : "No comparison records returned by the API"),
    "Contains simulated data":
      sourceMetadata.containsSimulatedData ?? "Not specified",
    ...(
      sourceMetadata.notices
        ? { "API notices": sourceMetadata.notices }
        : {}
    ),
  };

  exportData({
    format: normalizedFormat,
    headers,
    rows,
    fileName: `civicintel-comparison`,
    title: "CivicIntel - Comparison Report",
    subtitle: `${comparison.indicatorName} | ${comparison.selectedStates.join(" vs ")}`,
    metadata,
    landscape: true,
  });

  return hasRecords;
}

// --------------------------------------------------
// Comparison results table
// --------------------------------------------------

function ChartPlaceholder({ result, loading, error }) {
  if (loading) {
    return (
      <div className="bg-white p-6 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="size-8 animate-spin rounded-full border-4 border-[#E8EEF1] border-t-[#1F7A3F]" />

          <p className="mt-4 text-sm text-slate-500">
            Loading comparison results...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-5 sm:p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="text-sm font-semibold text-red-800">
            Unable to load comparison results
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-red-700">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!result || !Array.isArray(result.series)) {
    return (
      <div className="bg-white p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-800 sm:text-base">
          Comparison across selected states
        </h2>

        <p className="mt-2 text-xs text-slate-500">
          No comparison records have been returned by the backend.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 sm:text-base">
            Comparison across selected states
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Results returned by the CivicIntel comparison service.
          </p>
        </div>

        <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-medium text-green-800">
          API response received
        </span>
      </div>

      {result.contains_simulated_data === true && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
          Warning: This response contains simulated data. Treat
          the figures as simulated rather than verified statistics.
        </div>
      )}

      {Array.isArray(result.notices) &&
        result.notices.length > 0 && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3">
            <h3 className="text-xs font-semibold text-slate-700">
              API notices
            </h3>

            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-600">
              {result.notices.map((notice, index) => (
                <li key={index}>
                  {typeof notice === "string"
                    ? notice
                    : notice.message || JSON.stringify(notice)}
                </li>
              ))}
            </ul>
          </div>
        )}

      {result.series.length === 0 ? (
        <div className="mt-5 rounded-lg bg-slate-50 p-5 text-center">
          <p className="text-sm font-medium text-slate-700">
            No results available
          </p>

          <p className="mt-2 text-xs text-slate-500">
            The backend did not return comparison records for
            the selected indicator, states, or years.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {result.series.map((period, index) => (
            <section
              key={period.year ?? index}
              className="min-w-0"
            >
              <h3 className="mb-3 text-sm font-semibold text-[#0B3C5D]">
                Year: {formatValue(period.year)}
              </h3>

              {/* National average information */}
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-[#E8EEF1] p-3">
                  <p className="text-xs text-slate-500">
                    National average
                  </p>

                  <p className="mt-1 text-lg font-bold text-[#0B3C5D]">
                    {formatValue(period.national_average)}
                  </p>
                </div>

                <div className="rounded-lg bg-[#E8EEF1] p-3">
                  <p className="text-xs text-slate-500">
                    National average based on
                  </p>

                  <p className="mt-1 text-lg font-bold text-[#0B3C5D]">
                    {formatValue(period.national_average_based_on)}
                  </p>
                </div>
              </div>

              {/* State comparison records */}
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-190 border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-[#0B3C5D] text-white">
                      {[
                        "State",
                        "Zone",
                        "Value",
                        "Difference from national",
                        "Selected rank",
                        "National rank",
                        "Assessment",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-3 py-3 font-medium"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {Array.isArray(period.rows) &&
                    period.rows.length > 0 ? (
                      period.rows.map((row, rowIndex) => (
                        <tr
                          key={`${row.state}-${rowIndex}`}
                          className="border-b border-slate-200 last:border-0 even:bg-slate-50"
                        >
                          <td className="px-3 py-3 font-medium text-slate-800">
                            {formatValue(row.state)}
                          </td>

                          <td className="px-3 py-3 text-slate-600">
                            {formatValue(row.zone)}
                          </td>

                          <td className="px-3 py-3 font-medium text-slate-800">
                            {formatValue(row.value)}
                          </td>

                          <td className="px-3 py-3 text-slate-700">
                            {formatValue(
                              row.difference_from_national
                            )}
                          </td>

                          <td className="px-3 py-3 text-slate-700">
                            {formatValue(
                              row.rank_among_selected
                            )}
                          </td>

                          <td className="px-3 py-3 text-slate-700">
                            {formatValue(row.national_rank)}
                          </td>

                          <td className="px-3 py-3 text-slate-700">
                            {formatValue(row.assessment)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-3 py-6 text-center text-slate-500"
                        >
                          No state records available for this year.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {Array.isArray(period.missing_states) &&
                period.missing_states.length > 0 && (
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    <span className="font-medium text-slate-700">
                      Missing state records:
                    </span>{" "}
                    {period.missing_states.join(", ")}
                  </p>
                )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------
// Data provenance
// --------------------------------------------------

function ProvenancePlaceholder({ result }) {
  const hasSources =
    Array.isArray(result?.sources) &&
    result.sources.length > 0;

  return (
    <section className="mt-5 rounded-lg bg-[#E8EEF1] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-bold text-[#0B3C5D] sm:text-sm">
          DATA PROVENANCE RECORD
        </h3>

        <span className="rounded-full bg-[#C6D6E0] px-2 py-1 text-[10px] text-[#0B3C5D]">
          {hasSources ? "Source records received" : "Source details pending"}
        </span>
      </div>

      {hasSources ? (
        <div className="mt-4 space-y-3 text-xs text-slate-600">
          {result.sources.map((source, index) => (
            <div
              key={source.source_id ?? index}
              className="rounded-lg bg-white p-3"
            >
              <p className="font-medium text-[#0B3C5D]">
                Source {index + 1}
              </p>

              <p className="mt-1">
                Source ID:{" "}
                {formatValue(source.source_id)}
              </p>
            </div>
          ))}
        </div>
      ) : (
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
      )}

      <p className="mt-4 text-[10px] italic leading-relaxed text-slate-500">
        Source details, audit records, release dates, and licensing
        information should be confirmed against the backend's
        source metadata.
      </p>
    </section>
  );
}

// --------------------------------------------------
// Analysis brief
// --------------------------------------------------

function AnalysisBrief({ comparison, result, resultsLoading }) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-medium text-[#0B3C5D]">
          Analysis Brief
        </span>

        <span className="text-[10px] text-slate-500">
          {resultsLoading
            ? "Loading data"
            : result
              ? "API response received"
              : "Awaiting data"}
        </span>
      </div>

      <h2 className="mt-2 text-lg font-bold leading-snug text-slate-900">
        {comparison.indicatorName} Comparison
      </h2>

      <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
        This report compares the selected states using the
        indicator and data returned by the CivicIntel backend.
        Findings will depend on the available records.
      </p>

      <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-xs">
        <div className="flex items-start justify-between gap-3">
          <span className="text-slate-500">Indicator</span>

          <span className="max-w-[65%] wrap-break-word text-right font-medium text-slate-700">
            {comparison.indicatorName}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <span className="text-slate-500">Indicator key</span>

          <span className="max-w-[65%]  wrap-break-word text-right font-medium text-slate-700">
            {comparison.indicator}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <span className="text-slate-500">Selected states</span>

          <span className="max-w-[65%]  wrap-break-word text-right font-medium text-slate-700">
            {comparison.selectedStates.join(", ")}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <span className="text-slate-500">Year range</span>

          <span className="text-right font-medium text-slate-700">
            {comparison.fromYear && comparison.toYear
              ? comparison.fromYear === comparison.toYear
                ? comparison.fromYear
                : `${comparison.fromYear}–${comparison.toYear}`
              : "All available years"}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-3">
        <p className="text-xs font-medium text-[#0B3C5D]">
          Overview and key findings
        </p>

        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {resultsLoading
            ? "The comparison data is being retrieved."
            : result
              ? "The comparison records and national averages returned by the backend are displayed in the results section."
              : "Summary statistics and insights will appear when comparison records are available."}
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
          Facility coordinates, coverage, and registration totals
          will be shown when verified location data becomes available.
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

  const [result, setResult] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");

  const [notice, setNotice] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);

  // --------------------------------------------------
  // Login protection
  // --------------------------------------------------

  useEffect(() => {
    if (loading || isLoggedIn) {
      return;
    }

    navigate("/login", {
      replace: true,
      state: {
        from: {
          pathname: "/compare-results",
        },
        comparison,
        message: comparison
          ? "Log in to access your comparison results. Your selections will be kept."
          : "Log in to access comparison results.",
      },
    });
  }, [isLoggedIn, loading, navigate, comparison]);

  // --------------------------------------------------
  // Fetch actual comparison results
  // --------------------------------------------------

  useEffect(() => {
    if (!comparison || !isLoggedIn || loading) {
      return;
    }

    let isMounted = true;

    async function fetchComparison() {
      setResultsLoading(true);
      setResultsError("");
      setResult(null);

      try {
        const response = await getComparison({
          indicator: comparison.indicator,
          states: comparison.selectedStates,
          fromYear: comparison.fromYear || undefined,
          toYear: comparison.toYear || undefined,
        });

        const data =
          response?.data?.data ??
          response?.data ??
          response;

        if (isMounted) {
          setResult(data);
        }
      } catch (error) {
        if (isMounted) {
          setResultsError(
            error.message ||
              "Unable to load comparison results. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setResultsLoading(false);
        }
      }
    }

    fetchComparison();

    return () => {
      isMounted = false;
    };
  }, [comparison, isLoggedIn, loading]);

  // --------------------------------------------------
  // Authentication loading screen
  // --------------------------------------------------

  if (loading || !isLoggedIn) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-[#E7ECEF] px-4">
        <p className="text-sm text-[#0B3C5D]">
          Checking your sign-in status…
        </p>
      </main>
    );
  }

  // --------------------------------------------------
  // Export actual comparison records
  // --------------------------------------------------

  const handleExport = (format) => {
    setShowExportMenu(false);
    setNotice("");

    if (!comparison) {
      setNotice(
        "No valid comparison is available to export. Return to Compare States and configure a comparison."
      );
      return;
    }

    try {
      const records = (result?.series || []).flatMap((period) =>
        (period.rows || []).map((row) => ({
          Year: period.year,
          ...row,
          National_average: period.national_average,
          National_average_based_on:
            period.national_average_based_on,
        }))
      );

      const hasRecords = exportComparison(
        comparison,
        format,
        records,
        {
          dataStatus: result
            ? result.contains_simulated_data
              ? "Contains simulated data"
              : "Data returned by CivicIntel comparison API"
            : "No comparison data returned",
          containsSimulatedData:
            result?.contains_simulated_data ?? "Not specified",
          notices: Array.isArray(result?.notices)
            ? result.notices.join("; ")
            : "",
        }
      );

      setNotice(
        hasRecords
          ? `${format} export generated successfully with comparison records.`
          : `${format} file generated. It contains your comparison settings only because no state records were returned.`
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

  // --------------------------------------------------
  // Save comparison placeholder
  // --------------------------------------------------

  const handleSave = () => {
    setNotice(
      "Saving reports to your account is not connected yet. This feature will be enabled when the backend save-report endpoint is available."
    );
  };

  // --------------------------------------------------
  // Page UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#E7ECEF] pt-18">
      <main className="mx-auto max-w-7xl px-4 pb-8 pt-18 sm:px-8 sm:pt-14 lg:px-10">
        {/* Page heading */}
        <header className="relative z-10 mb-8 block w-full px-2 pt-2 text-center sm:mb-10 sm:px-0 sm:pt-0">
          <h1 className="block text-3xl font-bold leading-tight tracking-tight text-[#0B3C5D] sm:text-4xl lg:text-5xl">
            Data Generated
          </h1>

          <p className="mx-auto mt-3 block max-w-xl text-sm leading-relaxed text-slate-700">
            Here is an overview of your state comparison.
          </p>
        </header>

        {/* Invalid comparison warning */}
        {!comparison && (
          <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            No valid comparison selections were received. Return to
            Compare States to configure a new comparison.
          </div>
        )}

        {comparison && (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(280px,0.9fr)] lg:gap-10">
            {/* Main results column */}
            <div className="min-w-0">
              <div className="overflow-hidden bg-white shadow-sm">
                <ChartPlaceholder
                  result={result}
                  loading={resultsLoading}
                  error={resultsError}
                />

                <div className="p-4 pt-0 sm:p-5 sm:pt-0">
                  <ProvenancePlaceholder result={result} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="min-w-0">
              <AnalysisBrief
                comparison={comparison}
                result={result}
                resultsLoading={resultsLoading}
              />

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

              {/* Export and save notifications */}
              {notice && (
                <div
                  role="status"
                  className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900"
                >
                  {notice}
                </div>
              )}

              {/* Facility section */}
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
