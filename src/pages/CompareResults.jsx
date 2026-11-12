
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

import { toPng } from "html-to-image";
import civicIntelLogo from "../assets/civicintellogo1.png";

import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";

import { apiRequest } from "../api/api.js";
import {
  exportData,
  formatDisplayValue,
} from "../utility/exportData.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getComparison } from "../api/referenceData.js";
// import SurveyCoverageChart from "../components/SurveyCoverageChart.jsx";



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

// Get the years to send to the backend.
function getComparisonYears(comparison) {
  if (comparison.selectedYears?.length > 0) {
    return comparison.selectedYears;
  }

  const from = Number(comparison.fromYear);
  const to = Number(comparison.toYear);

  if (
    comparison.fromYear &&
    comparison.toYear &&
    Number.isInteger(from) &&
    Number.isInteger(to) &&
    from <= to
  ) {
    return Array.from(
      { length: to - from + 1 },
      (_, index) => from + index
    );
  }

  return [];
}

// Format missing values
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

  // Fields that must never appear in exported records.
  const isExcludedField = (field) => {
    const normalized = String(field)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    return [
      "sourceid",
      "datasetid",
      "assessment",
    ].includes(normalized);
  };

  // Clean backend records before preparing the export.
  const cleanRecords = hasRecords
  ? records.map((record) => {
      const cleanedRecord = Object.fromEntries(
        Object.entries(record).filter(
          ([key]) =>
            !isExcludedField(key) &&
            key.toLowerCase() !== "unit"
        )
      );

      if ("value" in cleanedRecord) {
        cleanedRecord.value = formatDisplayValue(
          cleanedRecord.value,
          record.unit || comparison.unit || ""
        );
      }

      if ("National_average" in cleanedRecord) {
        cleanedRecord.National_average = formatDisplayValue(
          cleanedRecord.National_average,
          record.unit || comparison.unit || ""
        );
      }

      return cleanedRecord;
    })
  : [];

  const headers = hasRecords
    ? Object.keys(cleanRecords[0])
    : ["Field", "Value"];

  const rows = hasRecords
    ? cleanRecords
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

function exportComparison(comparison, format, records = null) {
  const { headers, rows, hasRecords } = buildExportContent(
    comparison,
    records
  );

  const summary = [
    ["Number of states compared", comparison.selectedStates.length],
    ["Selected states", comparison.selectedStates.join(", ")],
    [
      "Selected years",
      comparison.selectedYears?.length
        ? comparison.selectedYears.join(", ")
        : "All available years",
    ],
  ];

  // Prepare chart data using the original API records.
  const yearColors = [
    [11, 60, 93],   // Navy
    [31, 122, 63],  // Green
    [214, 167, 86], // Gold
    [124, 58, 237], // Purple
  ];

  const chartData = (records || []).reduce((periods, record) => {
    const year = String(record.Year);

    let period = periods.find((item) => item.year === year);

    if (!period) {
      const yearColor = yearColors[periods.length % yearColors.length];

      period = {
        year,
        rows: [],
        color: yearColor,
      };

      periods.push(period);
    }

    const value = Number(record.value);

    if (
      record.state &&
      record.value !== null &&
      record.value !== undefined &&
      String(record.value).trim() !== "" &&
      Number.isFinite(value)
    ) {
      period.rows.push({
        state: record.state,
        value,
        color: period.color,
        colorLabel: period.year,
      });
    }

    return periods;
  }, []);

  exportData({
    format,
    headers,
    rows,
    fileName: "civicintel-comparison",
    title: String(comparison.domain || "Comparison").toUpperCase(),
    subtitle: `CivicIntel - ${comparison.indicatorName}`,
    summary,
    chartData,
    chartTitle: comparison.indicatorName,
    chartUnit: comparison.unit || "",
    chartColors: [
      [11, 60, 93],   // Navy
      [31, 122, 63],  // Green
      [214, 167, 86], // Gold
      [124, 58, 237], // Purple
    ],
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

  const chartYears = graphData.map((item) => String(item.year));

  const chartData = selectedStates.map((state) => {
    const stateData = { state };

    graphData.forEach((item) => {
      stateData[String(item.year)] = item[state];
    });

    return stateData;
  });

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
          <div className="mt-5 w-full max-w-3xl">
            <ResponsiveContainer
  width="100%"
  height={Math.max(360, selectedStates.length * 55)}
>
  <BarChart
    data={chartData}
    layout="vertical"
    margin={{
      top: 10,
      right: 55,
      left: 5,
      bottom: 10,
    }}
    barCategoryGap="25%"
    barGap={3}
  >
    <CartesianGrid
      strokeDasharray="3 3"
      horizontal={false}
      stroke="#E2E8F0"
    />

    <XAxis
      type="number"
      tick={{ fontSize: 10 }}
      axisLine={false}
      tickLine={false}
      tickFormatter={(value) =>
        `${formatValue(value)}${unit === "%" ? "%" : ""}`
      }
    />

    <YAxis
      type="category"
      dataKey="state"
      width={85}
      tick={{ fontSize: 10 }}
      axisLine={false}
      tickLine={false}
    />

    <Tooltip
      formatter={(value, name) => [
        formatDisplayValue(value, unit),
        name,
      ]}
      contentStyle={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "8px",
        border: "1px solid #E2E8F0",
        fontSize: "11px",
      }}
    />

    {chartYears.map((year, index) => (
      <Bar
        key={year}
        dataKey={year}
        name={year}
        fill={["#0B3C5D", "#1F7A3F", "#D6A756", "#7C3AED"][index % 4]}
        radius={[0, 4, 4, 0]}
        maxBarSize={18}
      >
        <LabelList
          dataKey={year}
          position="right"
          formatter={(value) =>
            value == null ? "" : formatDisplayValue(value, unit)
          }
          style={{
            fontSize: 9,
            fill: "#334155",
          }}
        />
      </Bar>
    ))}
  </BarChart>
</ResponsiveContainer>
          </div>

          {/* Year legend */}
<div className="mt-4 flex flex-wrap justify-center gap-4">
  {chartYears.map((year, index) => (
    <div key={year} className="flex items-center gap-2">
      <span
        className="size-2.5 rounded-sm"
        style={{
          backgroundColor: [
            "#0B3C5D",
            "#1F7A3F",
            "#D6A756",
            "#7C3AED",
          ][index % 4],
        }}
      />

      <span className="text-xs text-slate-600">
        {year}
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
                      {formatDisplayValue(period.national_average, unit)}
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
// Data Transparency
// --------------------------------------------------

function ProvenancePlaceholder({ result }) {
  const hasSources =
    Array.isArray(result?.sources) &&
    result.sources.length > 0;

  return (
    <section className="mt-5 rounded-lg bg-[#E8EEF1] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-bold text-[#0B3C5D] sm:text-sm">
          DATA TRANSPARENCY RECORD
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
  
    const analysisData = useMemo(() => {
    if (resultsLoading || !result || !Array.isArray(result.series)) {
      return null;
    }

    const validPeriods = result.series
      .map((period) => {
        const rows = (period.rows || [])
          .filter(
            (row) =>
              row.state &&
              row.value !== null &&
              row.value !== undefined &&
              row.value !== "" &&
              Number.isFinite(Number(row.value))
          )
          .map((row) => ({
            state: row.state,
            value: Number(row.value),
          }));

        return {
          year: period.year,
          national_average: period.national_average,
          missing_states: period.missing_states || [],
          rows,
        };
      })
      .filter((period) => period.rows.length > 0);

    const allRows = validPeriods.flatMap((period) =>
      period.rows.map((row) => ({
        ...row,
        year: period.year,
      }))
    );

    if (allRows.length === 0) {
      return {
        validPeriods,
        highest: null,
        lowest: null,
        reportingYears: [],
        stateCount: 0,
      };
    }

    const highest = allRows.reduce((current, row) =>
      row.value > current.value ? row : current
    );

    const lowest = allRows.reduce((current, row) =>
      row.value < current.value ? row : current
    );

    const reportingYears = [
      ...new Set(validPeriods.map((period) => String(period.year))),
    ].sort((a, b) => Number(a) - Number(b));

    const representedStates = [
      ...new Set(allRows.map((row) => row.state)),
    ];

    return {
      validPeriods,
      highest,
      lowest,
      reportingYears,
      stateCount: representedStates.length,
    };
  }, [result, resultsLoading]);


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
        indicator and data returned by the CivicIntel server.
        Findings will depend on the available records.
      </p>

      {/* OVERVIEW */}
      <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0B3C5D]">
            Overview
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            This report examines {comparison.indicatorName.toLowerCase()} across{" "}
            {comparison.selectedStates.length} selected Nigerian states
            using published CivicIntel data.
            The analysis covers{" "}
            {analysisData?.reportingYears.join(", ") || "the selected reporting period"}.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] text-slate-500">
              States represented
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {analysisData?.stateCount ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] text-slate-500">
              Reporting years
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              {analysisData?.reportingYears.join(", ") || "No data"}
            </p>
          </div>

          </div>

          {/* STATES WITH MISSING DATA */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0B3C5D]">
              States with Missing Data
            </h3>

            <div className="mt-3 space-y-3">
              {analysisData?.validPeriods?.length > 0 ? (
                analysisData.validPeriods.map((period) => (
                  <div key={period.year}>
                    <p className="text-xs font-medium text-slate-700">
                      {period.year}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {period.missing_states.length > 0
                        ? period.missing_states.join(", ")
                        : "No missing states reported for this year."}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">
                  Missing-data information is unavailable.
                </p>
              )}
            </div>
          </div>

          {/* KEY FINDINGS */}
          <div className="border-t border-slate-200 pt-5">

          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0B3C5D]">
            Key Findings
          </h3>

          <div className="mt-4 grid grid-cols-2 gap-3">

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] text-slate-500">
                Highest reported value
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {analysisData?.highest
                  ? `${formatValue(analysisData.highest.value)} ${
                      comparison.unit || result?.indicator?.unit || ""
                    }`
                  : "—"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {analysisData?.highest?.state ?? "No data"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] text-slate-500">
                Lowest reported value
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {analysisData?.lowest
                  ? `${formatValue(analysisData.lowest.value)} ${
                      comparison.unit || result?.indicator?.unit || ""
                    }`
                  : "—"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {analysisData?.lowest?.state ?? "No data"}
              </p>
            </div>

          </div>

          <p className="mt-3 text-[10px] leading-5 text-slate-500">
            These findings describe reported values and do not automatically
            indicate better or worse outcomes.
          </p>

        </div>
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
  const shareContentRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  // Automatically clear notifications after 2 seconds.
  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => {
      setNotice("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [notice]);


  // Login protection
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
        {
          ...comparison,
          unit: comparison.unit || result?.indicator?.unit || "",
        },
        format,
        records
      );
    } catch (error) {

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
          years: getComparisonYears(comparison),
        }),
      });

      setNotice(
        hasRecords
          ? `${format.toUpperCase()} export downloaded and recorded in your account history.`
          : `${format.toUpperCase()} export downloaded and recorded. It contains your comparison settings only because no state records were returned.`
      );
    } catch (error) {

      setNotice(
        `${format.toUpperCase()} file was downloaded, but CivicIntel could not record it in your account history: ${error.message}`
      );
    }
  };


  // --------------------------------------------------
  // Share comparison as a branded PNG
  // --------------------------------------------------

  
  const handleShare = async () => {
    if (!shareContentRef.current || sharing) {
      return;
    }

    try {
      setSharing(true);

      const imageUrl = await toPng(shareContentRef.current, {
        pixelRatio: 2,
        backgroundColor: "#E7ECEF",
        filter: (node) =>
          !(
            node instanceof HTMLElement &&
            node.dataset.shareExclude === "true"
          ),
      });

      const reportImage = new Image();
      reportImage.src = imageUrl;

      await new Promise((resolve, reject) => {
        reportImage.onload = resolve;
        reportImage.onerror = reject;
      });

      const logo = new Image();
      logo.src = civicIntelLogo;

      await new Promise((resolve, reject) => {
        logo.onload = resolve;
        logo.onerror = reject;
      });

      const headerHeight = 140;
      const canvas = document.createElement("canvas");

      canvas.width = reportImage.width;
      canvas.height = reportImage.height + headerHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not create report image.");
      }

      context.fillStyle = "#0B3C5D";
      context.fillRect(0, 0, canvas.width, headerHeight);

      context.drawImage(logo, 30, 25, 90, 90);

      context.fillStyle = "#FFFFFF";
      context.font = "bold 34px Arial";
      context.fillText("CivicIntel", 145, 65);

      context.font = "18px Arial";
      context.fillText("Comparison Report", 145, 100);

      context.drawImage(reportImage, 0, headerHeight);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) {
        throw new Error("Could not generate the report PNG.");
      }

      const file = new File(
        [blob],
        "civicintel-comparison-report.png",
        { type: "image/png" }
      );

      const canShareFile =
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] });

      if (canShareFile) {
        await navigator.share({
          title: "CivicIntel Comparison Report",
          text: "State comparison analysis from CivicIntel.",
          files: [file],
        });
      } else {
        const brandedImageUrl = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = brandedImageUrl;
        link.download = "civicintel-comparison-report.png";

        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        window.alert(
          "Unable to prepare the comparison image. Please try again."
        );
      }
    } finally {
      setSharing(false);
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
      years: getComparisonYears(comparison),

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

      setNotice(
        error.message ||
          "Could not save this comparison. Please try again."
      );
    } finally {
      setSavingComparison(false);
    }
  };


  // Page layout
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
          <div 
            ref={shareContentRef}
            className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(280px,0.9fr)] lg:gap-10"
          >
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

              {/* Share, export and save actions */}
              <div data-share-exclude="true">
                {/* Share report */}
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={sharing}
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-[#0B3C5D] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#082F49] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sharing ? "Preparing image..." : "Share report"}
                </button>

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
                {/* <SurveyCoverageChart /> */}
              </div>
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
