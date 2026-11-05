
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { apiRequest } from "../api/api.js";
import { exportData } from "../utility/exportData.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getComparison } from "../api/referenceData.js";
import SurveyCoverageChart from "../components/SurveyCoverageChart.jsx";



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

  const selectedYears = Array.isArray(value.selectedYears)
    ? [
        ...new Set(
          value.selectedYears
            .map(Number)
            .filter(
              (year) =>
                Number.isInteger(year) &&
                year >= 1900 &&
                year <= 2100
            )
        ),
      ].sort((a, b) => a - b)
    : [];

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
    selectedYears,
    fromYear,
    toYear,
    indicatorName: value.indicatorName || value.indicator,
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
          Field: "Selected years",
          Value:
            comparison.selectedYears?.join(", ") ||
            "All available years",
        },
        {
          Field: "From year",
          Value: comparison.fromYear || "Not specified",
        },
        {
          Field: "To year",
          Value: comparison.toYear || "Not specified",
        },
        {
          Field: "Note",
          Value:
            "This report contains comparison settings only. No indicator records were returned by the server.",
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
    "Selected years":
      comparison.selectedYears?.join(", ") ||
      "All available years",
    "From year": comparison.fromYear || "Not specified",
    "To year": comparison.toYear || "Not specified",
    "Data status":
      sourceMetadata.dataStatus ||
      (hasRecords
        ? "Data returned by CivicIntel comparison API"
        : "No comparison records returned by the API"),
    "Contains simulated data":
      sourceMetadata.containsSimulatedData ?? "Not specified",
    ...(sourceMetadata.notices
      ? { "API notices": sourceMetadata.notices }
      : {}),
  };

  exportData({
    format: normalizedFormat,
    headers,
    rows,
    fileName: "civicintel-comparison",
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

function ChartPlaceholder({result, loading, error, selectedStates = [], unit = "",}) {
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
        <h2 className="text-sm font-bold text-slate-800">
          Comparison across selected states
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          No comparison records have been returned by the server.
        </p>
      </div>
    );
  }

  // Prepare graph data: one entry per year, one value per state.
  const graphData = result.series.map((period) => {
    const yearData = { year: String(period.year) };

    (period.rows || []).forEach((row) => {
      if (
        row.value !== null &&
        row.value !== undefined &&
        row.value !== "" &&
        Number.isFinite(Number(row.value))
      ) {
        yearData[row.state] = Number(row.value);
      }
    });

    return yearData;
  });

  const hasData = graphData.some((item) =>
    selectedStates.some((state) => item[state] !== undefined)
  );

  const stateColors = ["#1F7A3F", "#D6A756", "#0B3C5D", "#8B5CF6"];

  return (
    <div className="min-w-0 bg-white p-4 sm:p-5">
      <div>
        <h2 className="text-sm font-bold text-slate-800 sm:text-base">
          Comparison across selected states
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Compare indicator values across the selected years.
          {unit && (
            <span className="ml-1 font-semibold text-[#0B3C5D]">
              Unit: {unit}
            </span>
          )}
        </p>
      </div>

      {result.contains_simulated_data === true && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          Warning: This response contains simulated data. Treat
          the figures as simulated rather than verified statistics.
        </div>
      )}

      {!hasData ? (
        <div className="mt-5 rounded-lg bg-slate-50 p-5 text-center">
          <p className="text-sm font-medium text-slate-700">
            No results available
          </p>
          <p className="mt-2 text-xs text-slate-500">
            The backend did not return state records for the selected
            indicator or years.
          </p>
        </div>
      ) : (
        <>
          {/* Grouped comparison graph */}
          <div className="mt-5 h-72 w-full max-w-3xl">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={graphData}
                margin={{
                  top: 15,
                  right: 15,
                  left: 0,
                  bottom: 10,
                }}
                barCategoryGap="35%"
                barGap={5}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />

                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />

                <Tooltip
                  formatter={(value, name) => [
                    `${Number(value).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}${unit ? ` ${unit}` : ""}`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.88)",
                    backdropFilter: "blur(6px)",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    fontSize: "11px",
                    padding: "8px 12px",
                  }}
                  itemStyle={{
                    padding: "2px 0",
                    fontWeight: 600,
                  }}
                  labelStyle={{
                    color: "#0B3C5D",
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}
                  wrapperStyle={{
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />

                {selectedStates.map((state, index) => (
                  <Bar
                    key={state}
                    dataKey={state}
                    name={state}
                    fill={stateColors[index % stateColors.length]}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap justify-center gap-4">
            {selectedStates.map((state, index) => (
              <div key={state} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-sm"
                  style={{
                    backgroundColor:
                      stateColors[index % stateColors.length],
                  }}
                />
                <span className="text-xs text-slate-600">
                  {state}
                </span>
              </div>
            ))}
          </div>

          {/* National averages and missing records */}
          <div className="mt-6 space-y-3">
            {result.series.map((period, index) => (
              <div
                key={period.year ?? index}
                className="rounded-lg border border-slate-200 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#0B3C5D]">
                    {period.year}
                  </p>

                  <p className="text-xs text-slate-600">
                    National average:{" "}
                    <span className="font-semibold text-slate-800">
                      {formatValue(period.national_average)}
                    </span>
                  </p>
                </div>

                {Array.isArray(period.missing_states) &&
                  period.missing_states.length > 0 && (
                    <p className="mt-2 text-[11px] text-slate-500">
                      No records for:{" "}
                      {period.missing_states.join(", ")}
                    </p>
                  )}
              </div>
            ))}
          </div>
        </>
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
          {hasSources
            ? "Source records received"
            : "Source details pending"}
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
                Source ID: {formatValue(source.source_id)}
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
  const displayedYears =
    comparison.selectedYears?.length > 0
      ? comparison.selectedYears.join(", ")
      : comparison.fromYear && comparison.toYear
        ? comparison.fromYear === comparison.toYear
          ? comparison.fromYear
          : `${comparison.fromYear}–${comparison.toYear}`
        : "All available years";

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

          <span className="max-w-[65%] wrap-break-word text-right font-medium text-slate-700">
            {comparison.indicator}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <span className="text-slate-500">Selected states</span>

          <span className="max-w-[65%] wrap-break-word text-right font-medium text-slate-700">
            {comparison.selectedStates.join(", ")}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <span className="text-slate-500">Selected years</span>

          <span className="max-w-[65%] text-right font-medium text-slate-700">
            {displayedYears}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <span className="text-slate-500">Unit</span>

          <span className="max-w-[65%] text-right font-medium text-slate-700">
            {comparison.unit || result?.indicator?.unit || "Not specified"}
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
              ? "The comparison records, state averages, and national averages returned by the backend are displayed in the results section."
              : "Summary statistics and insights will appear when comparison records are available."}
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
  const [savingComparison, setSavingComparison] = useState(false);

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
          state: {
            comparison,
          },
        },
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
        let responses;

        // Request each selected year separately.
        if (comparison.selectedYears?.length > 0) {
          console.log(
            "Years selected for comparison:",
            comparison.selectedYears
          );

          responses = await Promise.all(
            comparison.selectedYears.map((year) =>
              getComparison({
                indicator: comparison.indicator,
                states: comparison.selectedStates,
                fromYear: year,
                toYear: year,
              })
            )
          );
        } else {
          // Keep the existing behaviour for comparisons without selected years.
          responses = [
            await getComparison({
              indicator: comparison.indicator,
              states: comparison.selectedStates,
              fromYear: comparison.fromYear || undefined,
              toYear: comparison.toYear || undefined,
            }),
          ];
        }

        const results = responses.map(
          (response) =>
            response?.data?.data ?? response?.data ?? response
        );

        console.log("Individual year responses:", results);

        results.forEach((item) => {
          console.log("Year:", item.series?.[0]?.year);

          console.table(
            (item.series?.[0]?.rows || []).map((row) => ({
              year: item.series?.[0]?.year,
              state: row.state,
              value: row.value,
              zone: row.zone,
            }))
          );

          console.log(
            "Missing states:",
            item.series?.[0]?.missing_states
          );
        });

        const firstResult = results[0] || {};

        // Combine the series returned by all individual requests.
        const combinedResult = {
          ...firstResult,

          series: results
            .flatMap((item) =>
              Array.isArray(item.series) ? item.series : []
            )
            .sort((a, b) => Number(a.year) - Number(b.year)),

          notices: [
            ...new Map(
              results
                .flatMap((item) =>
                  Array.isArray(item.notices) ? item.notices : []
                )
                .map((item) => [JSON.stringify(item), item])
            ).values(),
          ],

          sources: [
            ...new Map(
              results
                .flatMap((item) =>
                  Array.isArray(item.sources) ? item.sources : []
                )
                .map((item) => [
                  item.source_id ?? JSON.stringify(item),
                  item,
                ])
            ).values(),
          ],

          missing_years: [
            ...new Set(
              results.flatMap((item) =>
                Array.isArray(item.missing_years)
                  ? item.missing_years
                  : []
              )
            ),
          ],

          contains_simulated_data: results.some(
            (item) => item.contains_simulated_data === true
          ),

          years_requested:
            comparison.selectedYears?.length > 0
              ? comparison.selectedYears
              : results.flatMap((item) =>
                  Array.isArray(item.years_requested)
                    ? item.years_requested
                    : []
                ),
        };

        console.log(
          "Combined comparison result:",
          combinedResult
        );

        if (isMounted) {
          setResult(combinedResult);
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

  const handleExport = async (format) => {
    setShowExportMenu(false);
    setNotice("");

    if (!comparison) {
      setNotice(
        "No valid comparison is available to export. Return to Compare States and configure a comparison."
      );
      return;
    }

    let hasRecords;

    // STEP 1: Generate and download the file.
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

      hasRecords = exportComparison(
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
    } catch (error) {
      console.error("Comparison export failed:", error);

      setNotice(
        error.message ||
          `The ${format} export could not be generated.`
      );

      return;
    }

    // STEP 2: Record the export in the authenticated user's history.
    try {
      await apiRequest("/exports", {
        method: "POST",
        body: JSON.stringify({
          format: format.toLowerCase(),
          title: "CivicIntel - Comparison Report",
          subtitle: `${comparison.indicatorName} | ${comparison.selectedStates.join(" vs ")}`,
          indicator: comparison.indicator,
          states: comparison.selectedStates,
          ...(comparison.fromYear && {
            year_from: Number(comparison.fromYear),
          }),
          ...(comparison.toYear && {
            year_to: Number(comparison.toYear),
          }),
        }),
      });

      setNotice(
        hasRecords
          ? `${format.toUpperCase()} export downloaded and recorded in your account history.`
          : `${format.toUpperCase()} export downloaded and recorded. It contains your comparison settings only because no state records were returned.`
      );
    } catch (error) {
      console.error("Export history recording failed:", error);

      setNotice(
        `${format.toUpperCase()} file was downloaded, but CivicIntel could not record it in your account history: ${error.message}`
      );
    }
  };

  // --------------------------------------------------
  // Save comparison to the user's account
  // --------------------------------------------------

  const handleSave = async () => {
    setNotice("");

    if (!comparison) {
      setNotice(
        "No valid comparison is available to save. Return to Compare States and configure a comparison."
      );
      return;
    }

    if (comparison.selectedStates.length < 2) {
      setNotice("Select at least two states before saving.");
      return;
    }

    setSavingComparison(true);

    const payload = {
      id: crypto.randomUUID(),
      title: `${comparison.domain} — ${comparison.indicatorName}`,
      indicator: comparison.indicator,
      states: comparison.selectedStates,

      // Preserve the exact years selected by the user.
      selected_years: comparison.selectedYears || [],

      // Keep the year range as well.
      ...(comparison.fromYear && {
        year_from: Number(comparison.fromYear),
      }),
      ...(comparison.toYear && {
        year_to: Number(comparison.toYear),
      }),

      saved_at: new Date().toISOString(),
    };

    try {
      await apiRequest("/saved-comparisons", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setNotice(
        "Comparison saved successfully to your account."
      );
    } catch (error) {
      console.error("Could not save comparison:", error);

      setNotice(
        error.message ||
          "Could not save this comparison. Please try again."
      );
    } finally {
      setSavingComparison(false);
    }
  };

  // --------------------------------------------------
  // Page layout
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
            <div className="min-w-0 space-y-5">
              {/* NEW: Average chart and table */}
             

              {/* Existing year-by-year results */}
              <div className="overflow-hidden bg-white shadow-sm">
                <ChartPlaceholder
                  result={result}
                  loading={resultsLoading}
                  error={resultsError}
                  selectedStates={comparison.selectedStates}
                  unit={comparison.unit || result?.indicator?.unit || ""}
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
                    {["CSV", "PDF", "XLSX"].map((format) => (
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
                disabled={savingComparison || !comparison}
                className="mt-2 flex w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#176332] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A3F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingComparison ? "Saving..." : "Save comparison"}

                {savingComparison ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Download
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                )}
              </button>

              {/* Export and save notifications */}
              {notice && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700"
                >
                  {notice}
                </div>
              )}

              {/* Survey coverage chart */}
              <SurveyCoverageChart />
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
                  d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-6.22 6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
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
                    selectedYears: comparison.selectedYears,
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
