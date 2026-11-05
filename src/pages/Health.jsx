import { apiRequest } from "../api/api.js";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { exportData } from "../utility/exportData.js";
import { motion } from "framer-motion";

import {
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

import {
  revealVariants,
  staggerContainer,
  useMotionSettings,
} from "../animation.js";

import { useAuth } from "../context/AuthContext.jsx";
import { getStates } from "../api/referenceData.js";
import { getPublishedRecords } from "../api/publishedData.js";

import civicIntel from "../assets/civicintel.hero.logo.png";
import civicIntelLogo from "../assets/civicintellogo1.png";
import HealthPic1 from "../assets/health/Health1.png";
import HealthPic2 from "../assets/health/Health2.png";
import HealthPic3 from "../assets/health/Health3.png";



const releases = [
  {
    category: "Health • Kano state",
    title: "Immunisation coverage trends 2019 to 2024",
    image: HealthPic1,
  },
  {
    category: "Health • National",
    title: "Maternal mortality: state-by-state, 2023",
    image: HealthPic2,
  },
  {
    category: "Health • Rivers state",
    title: "Health budget execution, FY2025",
    image: HealthPic3,
  },
];


// Safely formats API values.
// Empty or missing values are not converted to zero.
function formatValue(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 2,
  }).format(number);
}

function isValidNumericValue(value) {
  return (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== "" &&
    Number.isFinite(Number(value))
  );
}

function escapeXML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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

function Health() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const motionSettings = useMotionSettings();

  const restoredFilters = location.state?.healthFilters;

  // --------------------------------------------------
  // FILTER STATES
  // --------------------------------------------------

  const [indicator, setIndicator] = useState(
    restoredFilters?.indicator === "anc"
      ? "anc4_pct"
      : restoredFilters?.indicator ?? "anc4_pct"
  );

  const [state, setState] = useState(
    restoredFilters?.state ?? "all"
  );

  const [year, setYear] = useState(
    restoredFilters?.year ?? "all"
  );

  // --------------------------------------------------
  // REFERENCE DATA STATES
  // --------------------------------------------------

  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [statesError, setStatesError] = useState("");

  // --------------------------------------------------
  // HEALTH API STATES
  // --------------------------------------------------

  const [healthRecords, setHealthRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState("");

  // --------------------------------------------------
  // APPLIED FILTER STATES
  // --------------------------------------------------

  const [appliedFilters, setAppliedFilters] = useState(
    isLoggedIn && restoredFilters
      ? {
          ...restoredFilters,
          indicator:
            restoredFilters.indicator === "anc"
              ? "anc4_pct"
              : restoredFilters.indicator,
        }
      : null
  );

  const [hasAppliedFilters, setHasAppliedFilters] = useState(
    Boolean(isLoggedIn && restoredFilters)
  );

  const [exportOpen, setExportOpen] = useState(false);
  const [savingIndicator, setSavingIndicator] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");
  const [saveNoticeType, setSaveNoticeType] = useState("");


  useEffect(() => {
    let isMounted = true;

    async function loadStates() {
      try {
        const data = await getStates();

        if (!Array.isArray(data)) {
          throw new Error("The states response was not a list.");
        }

        if (isMounted) {
          setStates(data);
          setStatesError("");
        }
      } catch (error) {
        if (isMounted) {
          setStatesError(
            error instanceof Error
              ? error.message
              : "Could not load states. Please try again."
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

  // --------------------------------------------------
  // LOAD ALL PUBLISHED HEALTH RECORDS
  // --------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    async function loadHealthRecords() {
      try {
        const allRecords = [];
        const limit = 100;
        let offset = 0;
        let total = Infinity;

        while (offset < total) {
          const response = await getPublishedRecords({
            sector: "health",
            limit,
            offset,
          });

          if (!response || !Array.isArray(response.items)) {
            throw new Error(
              "The Health records response was not in the expected format."
            );
          }

          allRecords.push(...response.items);

          total = Number(response.total ?? allRecords.length);
          offset += response.items.length;

          if (
            response.items.length === 0 ||
            response.items.length < limit
          ) {
            break;
          }
        }

        if (isMounted) {
          setHealthRecords(allRecords);
          setRecordsError("");
        }
      } catch (error) {
        if (isMounted) {
          setRecordsError(
            error instanceof Error
              ? error.message
              : "Could not load Health records. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setRecordsLoading(false);
        }
      }
    }

    loadHealthRecords();

    return () => {
      isMounted = false;
    };
  }, []);


 
  // --------------------------------------------------
  // STATE AVERAGE HEALTH OVERVIEW
  // --------------------------------------------------

  const overviewStats = useMemo(() => {
    const groupedIndicators = {};

    healthRecords.forEach((record) => {
      const indicatorKey = record.indicator_key;
      const state = String(record.state ?? "").trim();
      const year = Number(record.year);

      if (
        !indicatorKey ||
        !state ||
        state.toLowerCase() === "national" ||
        !Number.isFinite(year) ||
        !isValidNumericValue(record.value)
      ) {
        return;
      }

      if (!groupedIndicators[indicatorKey]) {
        groupedIndicators[indicatorKey] = [];
      }

      groupedIndicators[indicatorKey].push(record);
    });

    const colors = [
      "#1F7A3F",
      "#8B2922",
      "#145C3B",
      "#0B3C5D",
      "#D6A400",
    ];

    return Object.entries(groupedIndicators)
      .map(([indicatorKey, records]) => {
        // Find the latest year for this indicator.
        const latestYear = Math.max(
          ...records.map((record) => Number(record.year))
        );

        const latestYearRecords = records.filter(
          (record) => Number(record.year) === latestYear
        );

        // Keep only one record per state.
        const uniqueStateRecords = [
          ...new Map(
            latestYearRecords.map((record) => [
              String(record.state).trim().toLowerCase(),
              record,
            ])
          ).values(),
        ];

        // Calculate the average across available states.
        const average =
          uniqueStateRecords.reduce(
            (sum, record) => sum + Number(record.value),
            0
          ) / uniqueStateRecords.length;

        const unit = uniqueStateRecords[0]?.unit ?? "";
        const indicatorName =
          uniqueStateRecords[0]?.indicator?.name ||
          uniqueStateRecords[0]?.indicator_name ||
          uniqueStateRecords[0]?.indicator ||
          indicatorKey;

        const formattedValue = formatValue(average);

        return {
          indicatorKey,
          label: "HEALTH DATA",
          description: indicatorName,
          color: "",
          value: unit.includes("%")
            ? `${formattedValue}%`
            : unit
              ? `${formattedValue} ${unit}`
              : formattedValue,
          reportingYear: latestYear,
          reportingStates: uniqueStateRecords.length,
        };
      })
      // Show indicators with the widest state coverage first.
      .sort(
        (a, b) =>
          b.reportingStates - a.reportingStates ||
          a.description.localeCompare(b.description)
      )
      // Display the five strongest indicators.
      .slice(0, 5)
      .map((stat, index) => ({
        ...stat,
        color: colors[index],
      }));
  }, [healthRecords]);


 
  // --------------------------------------------------
  // AVAILABLE INDICATORS WITH PUBLISHED DATA
  // --------------------------------------------------

  const indicatorOptions = useMemo(() => {
    const uniqueIndicators = new Map();

    healthRecords.forEach((record) => {
      const hasValidData = isValidNumericValue(record.value);

      if (
        record.indicator_key &&
        record.indicator &&
        hasValidData
      ) {
        uniqueIndicators.set(record.indicator_key, {
          key: record.indicator_key,
          label: record.indicator,
        });
      }
    });

    return Array.from(uniqueIndicators.values()).sort(
      (a, b) => a.label.localeCompare(b.label)
    );
  }, [healthRecords]);


  // --------------------------------------------------
  // AVAILABLE YEARS
  // --------------------------------------------------

  const yearOptions = useMemo(() => {
    return [
      ...new Set(
        healthRecords
          .map((record) => String(record.year))
          .filter(
            (value) =>
              value &&
              value !== "undefined" &&
              value !== "null"
          )
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [healthRecords]);

  // --------------------------------------------------
  // DERIVE VALID FILTER VALUES
  // --------------------------------------------------

  // These values are calculated during rendering.
  // No useEffect or setState is needed to correct selections.

  const effectiveIndicator = useMemo(() => {
    const indicatorExists = indicatorOptions.some(
      (item) => item.key === indicator
    );

    if (indicatorExists) {
      return indicator;
    }

    return indicatorOptions[0]?.key ?? "";
  }, [indicatorOptions, indicator]);

  const effectiveYear = useMemo(() => {
    if (year === "all") {
      return "all";
    }

    const yearExists = yearOptions.includes(String(year));

    if (yearExists) {
      return String(year);
    }

    return yearOptions[0] ?? "all";
  }, [yearOptions, year]);

  // --------------------------------------------------
  // FILTER CHART RECORDS
  // --------------------------------------------------

  const chartData = useMemo(() => {
    if (!appliedFilters) {
      return [];
    }

    return healthRecords
      .filter((record) => {
        const matchesIndicator =
          record.indicator_key === appliedFilters.indicator;

        const matchesState =
          appliedFilters.state === "all" ||
          record.state === appliedFilters.state;

        const matchesYear =
          appliedFilters.year === "all" ||
          String(record.year) === String(appliedFilters.year);

        const isNotNational =
          String(record.state).trim().toLowerCase() !== "national";

        return (
          matchesIndicator &&
          matchesState &&
          matchesYear &&
          isNotNational &&
          isValidNumericValue(record.value)
        );
      })
      .map((record) => ({
        ...record,
        numericValue: Number(record.value),
      }));
  }, [healthRecords, appliedFilters]);

  // --------------------------------------------------
  // NATIONAL BENCHMARK
  // --------------------------------------------------

  const nationalBenchmark = useMemo(() => {
    if (!appliedFilters || appliedFilters.year === "all") {
      return null;
    }

    return (
      healthRecords.find(
        (record) =>
          record.indicator_key === appliedFilters.indicator &&
          String(record.year) === String(appliedFilters.year) &&
          String(record.state).trim().toLowerCase() === "national" &&
          isValidNumericValue(record.value)
      ) ?? null
    );
  }, [healthRecords, appliedFilters]);

  // --------------------------------------------------
  // LATEST RECORD PER STATE
  // --------------------------------------------------

  const stateChartData = useMemo(() => {
    if (appliedFilters?.year !== "all") {
      return chartData;
    }

    const latestByState = new Map();

    chartData.forEach((record) => {
      const existing = latestByState.get(record.state);

      if (
        !existing ||
        Number(record.year) > Number(existing.year)
      ) {
        latestByState.set(record.state, record);
      }
    });

    return Array.from(latestByState.values());
  }, [chartData, appliedFilters]);

  // --------------------------------------------------
  // SELECTED INDICATOR INFORMATION
  // --------------------------------------------------

  const selectedIndicator = useMemo(() => {
    if (!appliedFilters) {
      return null;
    }

    return healthRecords.find(
      (record) =>
        record.indicator_key === appliedFilters.indicator
    );
  }, [healthRecords, appliedFilters]);

  const indicatorLabel =
    selectedIndicator?.indicator ?? "Health indicator";

  const indicatorUnit = selectedIndicator?.unit ?? "";

  const isPercentageIndicator = indicatorUnit.includes("%");

  // --------------------------------------------------
  // CHART SCALE
  // --------------------------------------------------

  const maximumValue = useMemo(() => {
    const values = stateChartData.map((item) =>
      Math.abs(item.numericValue)
    );

    if (nationalBenchmark) {
      values.push(Math.abs(Number(nationalBenchmark.value)));
    }

    return values.length ? Math.max(...values) : 0;
  }, [stateChartData, nationalBenchmark]);

  // --------------------------------------------------
  // CHART ROWS
  // --------------------------------------------------

  const chartRows = useMemo(() => {
    return [...stateChartData]
      .sort((a, b) => b.numericValue - a.numericValue)
      .map((item) => {
        const barWidth = isPercentageIndicator
          ? Math.max(0, Math.min(item.numericValue, 100))
          : maximumValue > 0
            ? (Math.abs(item.numericValue) / maximumValue) * 100
            : 0;

        return {
          ...item,
          barWidth,
          
        };
      });
  }, [
    stateChartData,
    maximumValue,
    isPercentageIndicator,
  ]);

  // --------------------------------------------------
  // NATIONAL BENCHMARK POSITION
  // --------------------------------------------------

  const benchmarkValue = nationalBenchmark
    ? Number(nationalBenchmark.value)
    : null;

  const benchmarkPosition =
    benchmarkValue !== null &&
    Number.isFinite(benchmarkValue)
      ? isPercentageIndicator
        ? Math.max(0, Math.min(benchmarkValue, 100))
        : maximumValue > 0
          ? Math.max(
              0,
              Math.min(
                (Math.abs(benchmarkValue) / maximumValue) * 100,
                100
              )
            )
          : null
      : null;

  // --------------------------------------------------
  // APPLY FILTERS
  // --------------------------------------------------

  const handleApplyFilters = (event) => {
    event.preventDefault();

    const filters = {
      indicator: effectiveIndicator,
      state,
      year: effectiveYear,
    };

    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: {
            pathname: "/health",
            state: {
              healthFilters: filters,
            },
          },
          message:
            "Please log in to view health charts and analysis.",
        },
      });

      return;
    }

    setAppliedFilters(filters);
    setHasAppliedFilters(true);
    setExportOpen(false);
  };

  // --------------------------------------------------
  // LOGIN NAVIGATION
  // --------------------------------------------------

  const handleLogin = () => {
    navigate("/login", {
      state: {
        from: {
          pathname: "/health",
          state: {
            healthFilters: {
              indicator: effectiveIndicator,
              state,
              year: effectiveYear,
            },
          },
        },
        message: "Please log in to access health data analysis.",
      },
    });
  };

  // --------------------------------------------------
  // SIGNUP NAVIGATION
  // --------------------------------------------------

  const handleSignup = () => {
    navigate("/signup", {
      state: {
        from: {
          pathname: "/health",
          state: {
            healthFilters: {
              indicator: effectiveIndicator,
              state,
              year: effectiveYear,
            },
          },
        },
      },
    });
  };

  // --------------------------------------------------
  // EXPORT DATA
  // --------------------------------------------------

  const exportRows = chartRows.map((record) => ({
    State: record.state,
    Indicator: record.indicator,
    IndicatorKey: record.indicator_key,
    Year: record.year,
    Value: record.value,
    Unit: record.unit,
    DatasetID: record.dataset_id,
  }));

  const exportFilename = `civicintel-health-${
    appliedFilters?.indicator ?? "data"
  }-${appliedFilters?.year ?? "all"}`;

    // --------------------------------------------------
  // RECORD EXPORT IN BACKEND
  // --------------------------------------------------

  
const recordHealthExport = async (format) => {
  if (!isLoggedIn || exportRows.length === 0 || !appliedFilters) {
    return false;
  }

  const exportedStates = [
    ...new Set(
      exportRows.map((row) => row.State).filter(Boolean)
    ),
  ];

  const exportedYears = exportRows
    .map((row) => Number(row.Year))
    .filter(Number.isFinite);

  const uniqueDatasetIds = [
    ...new Set(
      exportRows
        .map((row) => row.DatasetID)
        .filter(Boolean)
    ),
  ];

  const yearFrom = exportedYears.length
    ? Math.min(...exportedYears)
    : null;

  const yearTo = exportedYears.length
    ? Math.max(...exportedYears)
    : null;

  const subtitle = [
    exportedStates.length === 1
      ? exportedStates[0]
      : exportedStates.length === 0
        ? "No state specified"
        : "All selected states",
    yearFrom === null
      ? "Year unavailable"
      : yearFrom === yearTo
        ? String(yearFrom)
        : `${yearFrom}–${yearTo}`,
  ].join(" · ");

  const payload = {
    format,
    title: `Health — ${indicatorLabel}`,
    subtitle,
    indicator: appliedFilters.indicator,
    states: exportedStates,
    ...(yearFrom !== null && { year_from: yearFrom }),
    ...(yearTo !== null && { year_to: yearTo }),
    ...(uniqueDatasetIds.length === 1 && {
      dataset_id: uniqueDatasetIds[0],
    }),
  };

  try {
    await apiRequest("/exports", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return true;
  } catch (error) {
    console.error("Could not record Health export:", error);

    window.alert(
      "Your file was exported, but CivicIntel could not save it to Recent Exports."
    );

    return false;
  }
};


    // CSV EXPORT
  const handleExportCSV = async () => {
    if (exportRows.length === 0) {
      window.alert("There are no records to export.");
      return;
    }

    const headers = Object.keys(exportRows[0]);

    const csvContent = [
      headers.join(","),
      ...exportRows.map((row) =>
        headers
          .map((header) => {
            const value = String(row[header] ?? "");
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    downloadFile(
      csvContent,
      `${exportFilename}.csv`,
      "text/csv;charset=utf-8;"
    );

    setExportOpen(false);

    await recordHealthExport("csv");
  };

    // XLSX EXPORT
    const handleExportXLSX = async () => {
      if (exportRows.length === 0) {
        window.alert("There are no records to export.");
        return;
      }

      const headers = Object.keys(exportRows[0]);

      exportData({
        format: "xlsx",
        headers,
        rows: exportRows,
        fileName: exportFilename,
        title: "CivicIntel Health Data Report",
        subtitle: `Indicator: ${indicatorLabel}`,
        metadata: {
          State:
            appliedFilters.state === "all"
              ? "All states"
              : appliedFilters.state,
          Year:
            appliedFilters.year === "all"
              ? "All years"
              : appliedFilters.year,
        },
      });

      setExportOpen(false);

      await recordHealthExport("xlsx");
    };

  // PDF / PRINT EXPORT
  const handleExportPDF = async () => {
    if (exportRows.length === 0) {
      window.alert("There are no records to export.");
      return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      window.alert(
        "Your browser blocked the print window. Please allow pop-ups and try again."
      );
      return;
    }

    const tableRows = exportRows
      .map(
        (row) => `
          <tr>
            <td>${escapeXML(row.State)}</td>
            <td>${escapeXML(row.Indicator)}</td>
            <td>${escapeXML(row.Year)}</td>
            <td>${escapeXML(row.Value)}</td>
            <td>${escapeXML(row.Unit)}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CivicIntel Health Data Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #20272B;
            }

            h1 {
              color: #0B3C5D;
              margin-bottom: 8px;
            }

            .subtitle {
              color: #64748b;
              font-size: 13px;
              margin-bottom: 24px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }

            th, td {
              border: 1px solid #d5dde1;
              padding: 10px;
              text-align: left;
            }

            th {
              background: #0B3C5D;
              color: white;
            }

            tr:nth-child(even) {
              background: #f1f5f6;
            }

            .footer {
              margin-top: 24px;
              font-size: 11px;
              color: #64748b;
            }

            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>

        <body>
          <h1>CivicIntel — Health Data Report</h1>

          <p class="subtitle">
            Indicator: ${escapeXML(indicatorLabel)} |
            State: ${escapeXML(
              appliedFilters.state === "all"
                ? "All states"
                : appliedFilters.state
            )} |
            Year: ${escapeXML(
              appliedFilters.year === "all"
                ? "All years"
                : appliedFilters.year
            )}
          </p>

          <table>
            <thead>
              <tr>
                <th>State</th>
                <th>Indicator</th>
                <th>Year</th>
                <th>Value</th>
                <th>Unit</th>
              </tr>
            </thead>

            <tbody>${tableRows}</tbody>
          </table>

          <p class="footer">
            Source: CivicIntel published Health records.
            This report contains the records returned by the connected dataset.
          </p>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

        printWindow.document.close();
    setExportOpen(false);

    await recordHealthExport("pdf");
  };

  // --------------------------------------------------
// SAVE INDICATOR
// --------------------------------------------------

const handleSaveIndicator = async () => {
  if (!isLoggedIn) {
    handleLogin();
    return;
  }

  if (!appliedFilters || chartRows.length === 0 || chartData.length === 0) {
    setSaveNotice("There are no Health records available to save.");
    setSaveNoticeType("error");
    return;
  }

  setSavingIndicator(true);
  setSaveNotice("");
  setSaveNoticeType("");

  // Get all states represented by the selected filters.
  const selectedStates = [
    ...new Set(
      chartData
        .map((record) => record.state)
        .filter(Boolean)
    ),
  ];

  // Get the reporting years represented by the selected filters.
  const selectedYears = chartData
    .map((record) => Number(record.year))
    .filter(Number.isFinite);

  const yearFrom = selectedYears.length
    ? Math.min(...selectedYears)
    : null;

  const yearTo = selectedYears.length
    ? Math.max(...selectedYears)
    : null;

  const payload = {
    id: crypto.randomUUID(),
    title: `Health — ${indicatorLabel}`,
    indicator: appliedFilters.indicator,
    states: selectedStates,
    year_from: yearFrom,
    year_to: yearTo,
    saved_at: new Date().toISOString(),
  };

  try {
    await apiRequest("/saved-comparisons", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setSaveNotice("Health indicator saved successfully to your account.");
    setSaveNoticeType("success");
  } catch (error) {
    console.error("Could not save Health indicator:", error);

    setSaveNotice(
      error instanceof Error
        ? error.message
        : "Could not save this indicator. Please try again."
    );

    setSaveNoticeType("error");
  } finally {
    setSavingIndicator(false);
  }
};

  // --------------------------------------------------
  // RETRY LOADING STATES
  // --------------------------------------------------

  const retryLoadStates = async () => {
    setStatesLoading(true);
    setStatesError("");

    try {
      const data = await getStates();

      if (!Array.isArray(data)) {
        throw new Error("The states response was not a list.");
      }

      setStates(data);
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
            Nigeria · Health data
          </p>

          <h1 className="max-w-xl text-3xl font-bold leading-tight text-[#0B3C5D] sm:text-4xl lg:text-5xl">
            Nigeria&apos;s{" "}
            <span className="text-[#1F7A3F]">Health</span>{" "}
            indicators, by state and over time
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-[#38464D]">
            Explore coverage, outcomes, and system indicators drawn from
            national surveys and administrative sources, filterable by state
            and year.
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
              src={civicIntel}
              alt="Digital technology and data visualisation"
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

      {/* HEALTH FILTERS */}
      <section className="bg-[#EAF2EC] px-5 py-8 sm:px-8 lg:px-12">
        <motion.div
          {...motionSettings}
          variants={revealVariants}
          className="mx-auto max-w-5xl"
        >
          <SectionHeading>
            HEALTH INDICATOR
          </SectionHeading>

          <form onSubmit={handleApplyFilters}>
            <div className="grid gap-4 md:grid-cols-3">

              {/* INDICATOR FILTER */}
              <label className="flex flex-col gap-2 text-xs">
                Indicator

                <select
                  value={effectiveIndicator}
                  onChange={(event) =>
                    setIndicator(event.target.value)
                  }
                  disabled={
                    recordsLoading ||
                    indicatorOptions.length === 0
                  }
                  className="w-full rounded-xl border border-[#B7C5CB] bg-[#C5D2D9] px-3 py-3 text-sm outline-none focus:border-[#1F7A3F] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {recordsLoading && (
                    <option value="">
                      Loading indicators...
                    </option>
                  )}

                  {!recordsLoading &&
                    indicatorOptions.length === 0 && (
                      <option value="">
                        No indicators available
                      </option>
                    )}

                  {indicatorOptions.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* STATE FILTER */}
              <label className="flex flex-col gap-2 text-xs">
                State

                <select
                  value={state}
                  onChange={(event) =>
                    setState(event.target.value)
                  }
                  disabled={
                    statesLoading || states.length === 0
                  }
                  className="w-full rounded-xl border border-[#B7C5CB] bg-[#C5D2D9] px-3 py-3 text-sm outline-none focus:border-[#1F7A3F] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <option value="all">
                    All states
                  </option>

                  {statesLoading && (
                    <option value="loading" disabled>
                      Loading states...
                    </option>
                  )}

                  {statesError && (
                    <option value="error" disabled>
                      Could not load states
                    </option>
                  )}

                  {!statesLoading &&
                    !statesError &&
                    states.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                </select>

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

              {/* YEAR FILTER */}
              <label className="flex flex-col gap-2 text-xs">
                Year

                <select
                  value={effectiveYear}
                  onChange={(event) =>
                    setYear(event.target.value)
                  }
                  disabled={
                    recordsLoading || yearOptions.length === 0
                  }
                  className="w-full rounded-xl border border-[#B7C5CB] bg-[#C5D2D9] px-3 py-3 text-sm outline-none focus:border-[#1F7A3F] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <option value="all">
                    All available years
                  </option>

                  {yearOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* API ERROR */}
            {recordsError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <p>{recordsError}</p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-2 font-semibold underline"
                >
                  Reload page
                </button>
              </div>
            )}

            {/* APPLY BUTTON */}
            <button
              type="submit"
              disabled={
                recordsLoading ||
                indicatorOptions.length === 0 ||
                Boolean(recordsError)
              }
              className="mx-auto mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176331] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 md:w-1/2"
            >
              Apply <span aria-hidden="true">→</span>
            </button>
          </form>
        </motion.div>
      </section>

      {/* NATIONAL HEALTH OVERVIEW */}
      <section className="bg-[#0B3C5D] px-5 py-8 sm:px-8 lg:px-12">
        <motion.div
          {...motionSettings}
          variants={staggerContainer}
          className="mx-auto max-w-5xl"
        >
          <SectionHeading dark>
            NATIONAL HEALTH OVERVIEW
          </SectionHeading>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            {overviewStats.map((stat) => (
              <motion.article
                key={stat.description}
                variants={revealVariants}
                className="group min-h-32 cursor-pointer rounded-md border border-transparent border-l-4 bg-[#F0F1F0] p-4 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#1F7A3F] hover:shadow-lg active:scale-[0.98]"
                style={{ borderLeftColor: stat.color }}
              >
                <span
                  className="inline-block rounded-full px-3 py-1 text-[9px] font-medium text-white transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: stat.color }}
                >
                  {stat.label}
                </span>

                <p className="mt-2 text-xl font-bold text-[#20272B]">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs leading-5 text-[#20272B]">
                  {stat.description}
                </p>

                <div className="my-3 border-t border-dashed border-gray-400" />

                <p className="text-[10px] text-gray-600">
                  {stat.reportingYear
                    ? `State average · ${stat.reportingYear}`
                    : "No state data available"}
                </p>

                <p className="mt-1 text-[9px] text-gray-500">
                  {stat.reportingStates > 0
                    ? `Based on ${stat.reportingStates} state records`
                    : ""}
                </p>
              </motion.article>
            ))}
          </motion.div>
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
                Unlock Health Data Analysis
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/70">
                Create an account or log in to view health charts, explore
                filtered data, and export your analysis.
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
          ) : !hasAppliedFilters || !appliedFilters ? (
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center">
              <h2 className="text-xl font-bold">
                Your Health Analysis
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/70">
                Select your indicator, state, and year above, then click
                Apply to view the chart and analysis.
              </p>
            </div>
          ) : (
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2.1fr)_minmax(300px,0.9fr)]">

              {/* LEFT: WHITE CHART PANEL */}
              <div className="min-w-0 bg-white p-4 text-[#0B2F45] shadow-xl sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold sm:text-lg">
                        {indicatorLabel} by Selected States
                      </h2>

                      <span
                        title="Values are retrieved from CivicIntel's published Health records."
                        className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-gray-400 text-[10px] text-gray-500"
                      >
                        i
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] text-gray-500">
                      {indicatorUnit
                        ? `Unit: ${indicatorUnit}`
                        : "Published indicator values"}

                      {" · "}

                      {appliedFilters.year === "all"
                        ? "Latest available record per state"
                        : `Reporting year ${appliedFilters.year}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-gray-500">
                    {nationalBenchmark ? (
                      <>
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-sm bg-[#16512F]" />
                          At/above national
                        </span>

                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-sm bg-[#0B3048]" />
                          Below national
                        </span>
                      </>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-[#16512F]" />
                        State value
                      </span>
                    )}

                    {nationalBenchmark && (
                      <span className="flex items-center gap-1.5">
                        <span className="h-0.5 w-3 bg-red-600" />
                        National benchmark
                      </span>
                    )}
                  </div>
                </div>

                {/* CHART CONTENT */}
                {recordsLoading ? (
                  <div className="flex min-h-64 items-center justify-center">
                    <p className="text-sm text-gray-500">
                      Loading Health records...
                    </p>
                  </div>
                ) : chartRows.length > 0 ? (
                  <>
                    

                    {/* CHART AXIS */}
                    
                    <div className="mt-10 w-full overflow-x-auto pb-3 ">
                      <div
                        className="h-90"
                        style={{
                          width: `${Math.max(chartRows.length * 34, 600)}px`,
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartRows}
                            margin={{ top: 30, right: 20, left: 5, bottom: 55 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#E2E8F0"
                            />

                            <XAxis
                              dataKey="state"
                              angle={-35}
                              textAnchor="end"
                              interval={0}
                              height={65}
                              tick={{ fontSize: 10, fill: "#64748B" }}
                              axisLine={{ stroke: "#CBD5E1" }}
                              tickLine={false}
                            />

                            <YAxis
                              domain={[0, "auto"]}
                              tick={{ fontSize: 10, fill: "#64748B" }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) =>
                                isPercentageIndicator ? `${value}%` : value
                              }
                            />

                            <Tooltip
                              formatter={(value, name, props) => [
                                `${formatValue(value)} ${props.payload.unit || indicatorUnit || ""}`,
                                "Value",
                              ]}
                              labelFormatter={(label) => `State: ${label}`}
                              contentStyle={{
                                borderRadius: "10px",
                                border: "1px solid #E2E8F0",
                                fontSize: "12px",
                              }}
                            />

                            {benchmarkValue !== null &&
                              Number.isFinite(benchmarkValue) && (
                                <ReferenceLine
                                  y={benchmarkValue}
                                  stroke="#DC2626"
                                  strokeDasharray="6 4"
                                  strokeWidth={2}
                                  label={{
                                    value: `National: ${formatValue(benchmarkValue)}`,
                                    position: "insideTopRight",
                                    fill: "#DC2626",
                                    fontSize: 10,
                                  }}
                                />
                              )}

                            <Bar
                              dataKey="numericValue"
                              name="Value"
                              radius={[5, 5, 0, 0]}
                              maxBarSize={42}
                            >
                              {chartRows.map((item) => {
                                const aboveBenchmark =
                                  benchmarkValue !== null &&
                                  item.numericValue >= benchmarkValue;

                                return (
                                  <Cell
                                    key={`${item.state}-${item.indicator_key}-${item.year}`}
                                    fill={
                                      benchmarkValue === null
                                        ? "#16512F"
                                        : aboveBenchmark
                                          ? "#16512F"
                                          : "#0B3048"
                                    }
                                  />
                                );
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>


                    {!nationalBenchmark && (
                      <p className="mt-3 text-[10px] leading-4 text-gray-400">
                        No matching national benchmark was returned for this
                        indicator and reporting year. Bars show state values
                        only; no national comparison is inferred.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="mt-8 rounded-lg bg-[#E8EEF1] p-6 text-sm leading-6 text-gray-600">
                    No published Health records match these filters. Try
                    selecting another indicator, state, or year.
                  </div>
                )}

                {/* PROVENANCE */}
                <div className="mt-8 rounded-lg bg-[#E7ECEF] p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-[#0B3C5D]">
                      <span className="text-[#1F7A3F]">✓</span>
                      VERIFIED PROVENANCE RECORD
                    </h3>

                    <span className="rounded-full bg-[#C5D2D9] px-2 py-1 text-[9px] text-[#0B3C5D]">
                      Published dataset
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 text-[10px] leading-5 text-gray-500 sm:grid-cols-2">
                    <p>
                      <strong className="text-[#0B3C5D]">
                        Indicator:
                      </strong>{" "}
                      {indicatorLabel}
                    </p>

                    <p>
                      <strong className="text-[#0B3C5D]">
                        Data vintage:
                      </strong>{" "}
                      {appliedFilters.year === "all"
                        ? "Multiple available years"
                        : appliedFilters.year}
                    </p>

                    <p>
                      <strong className="text-[#0B3C5D]">
                        Dataset ID:
                      </strong>{" "}
                      {[
                        ...new Set(
                          chartRows
                            .map((item) => item.dataset_id)
                            .filter(Boolean)
                        ),
                      ].join(", ") || "Not provided by API"}
                    </p>

                    <p>
                      <strong className="text-[#0B3C5D]">
                        Unit:
                      </strong>{" "}
                      {indicatorUnit || "Not provided"}
                    </p>
                  </div>

                  <p className="mt-3 border-t border-gray-300 pt-3 text-[9px] italic leading-4 text-gray-500">
                    Platform data note: This view displays records returned
                    by CivicIntel&apos;s published Health API. Source
                    documentation, independent audit details, QA reference,
                    audited date, and licence information are not currently
                    supplied by this endpoint.
                  </p>
                </div>
              </div>

              {/* RIGHT: DARK ANALYSIS PANEL */}
              <aside className="min-w-0 space-y-7">

                {/* ANALYSIS BRIEF */}
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-sm bg-[#E7ECEF] px-2 py-1 text-[10px] font-medium text-[#0B3C5D]">
                      Analysis Brief
                    </span>

                    <span className="text-[10px] text-white/50">
                      {appliedFilters.year === "all"
                        ? "Multiple reporting years"
                        : `${appliedFilters.year} data`}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-bold leading-snug sm:text-2xl">
                    {indicatorLabel}

                    <span className="block text-white/90">
                      State-level analysis
                    </span>
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/65">
                    Explore how {indicatorLabel.toLowerCase()} varies across
                    the selected Nigerian states. The figures shown are
                    published records retrieved from CivicIntel&apos;s
                    Health dataset.
                  </p>

                  <p className="mt-3 text-xs leading-5 text-white/45">
                    {chartRows.length} state record
                    {chartRows.length === 1 ? "" : "s"} displayed
                    {" · "}
                    {appliedFilters.state === "all"
                      ? "All available states"
                      : appliedFilters.state}
                  </p>
                </div>

                {/* NATIONAL COMPARISON */}
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xs font-medium text-white/70">
                      National benchmark comparison
                    </h3>

                    {nationalBenchmark ? (
                      <span className="text-[10px] text-white/50">
                        {formatValue(benchmarkValue)}
                        {nationalBenchmark.unit}
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/40">
                        Not available
                      </span>
                    )}
                  </div>

                  {nationalBenchmark ? (
                    <>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                        <div
                          className="h-full rounded-full bg-[#1F7A3F]"
                          style={{
                            width: `${Math.min(
                              Math.max(benchmarkPosition ?? 0, 0),
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="mt-2 text-[10px] leading-5 text-white/50">
                        National value for {appliedFilters.year}:{" "}
                        {formatValue(benchmarkValue)}
                        {nationalBenchmark.unit}
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-xs leading-5 text-white/50">
                      A comparable national value was not returned for this
                      indicator and year. A regional or national gap cannot be
                      calculated reliably yet.
                    </p>
                  )}
                </div>

                {/* EXPORT AND SAVE BUTTONS */}
                <div className="flex flex-col gap-3">

                  {/* EXPORT DROPDOWN */}
                  <div className="relative w-full">
                    <button
                      type="button"
                      onClick={() =>
                        setExportOpen((previous) => !previous)
                      }
                      disabled={chartRows.length === 0}
                      aria-label="Choose export format"
                      aria-expanded={exportOpen}
                      className="flex w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176331] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span>Export</span>

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-200 ${
                          exportOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>

                    {exportOpen && (
                      <div className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 text-[#20272B] shadow-xl">
                        <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Choose format
                        </p>

                        <button
                          type="button"
                          onClick={handleExportPDF}
                          className="w-full px-4 py-2.5 text-left text-sm transition hover:bg-[#EAF2EC] hover:text-[#1F7A3F]"
                        >
                          Export PDF
                        </button>

                        <button
                          type="button"
                          onClick={handleExportCSV}
                          className="w-full px-4 py-2.5 text-left text-sm transition hover:bg-[#EAF2EC] hover:text-[#1F7A3F]"
                        >
                          Export CSV
                        </button>

                        <button
                          type="button"
                          onClick={handleExportXLSX}
                          className="w-full px-4 py-2.5 text-left text-sm transition hover:bg-[#EAF2EC] hover:text-[#1F7A3F]"
                        >
                          Export XLSX
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SAVE INDICATOR */}
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleSaveIndicator}
                      disabled={savingIndicator || chartRows.length === 0}
                      className="flex w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176331] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span>
                        {savingIndicator ? "Saving..." : "Save indicator"}
                      </span>

                      {savingIndicator ? (
                        <svg
                          className="h-5 w-5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="opacity-25"
                          />
                          <path
                            d="M21 12a9 9 0 0 0-9-9"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <path d="m7 10 5 5 5-5" />
                          <path d="M12 15V3" />
                        </svg>
                      )}
                    </button>

                    {saveNotice && (
                      <p
                        role="status"
                        aria-live="polite"
                        className={`rounded-lg px-3 py-2 text-xs leading-5 ${
                          saveNoticeType === "success"
                            ? "border border-green-400/30 bg-green-500/10 text-green-200"
                            : "border border-red-400/30 bg-red-500/10 text-red-200"
                        }`}
                      >
                        {saveNotice}
                      </p>
                    )}
</div>
                </div>

                {/* FACILITY SPOT CHECK */}
                <div className="pt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">
                      Facility Spot Check
                    </h3>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white/90"
                      aria-hidden="true"
                    >
                      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-white/65">
                    Verified facility locations and audit points will appear
                    here when facility-level GPS data is connected.
                  </p>

                  <div className="relative mt-4 flex h-44 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-[#DCE8E5]">
                    <div className="absolute inset-0 opacity-40">
                      <svg
                        viewBox="0 0 400 180"
                        preserveAspectRatio="none"
                        className="h-full w-full"
                        aria-hidden="true"
                      >
                        <path
                          d="M-20 40 L80 20 L130 65 L210 15 L300 55 L420 25"
                          fill="none"
                          stroke="#A2B9AE"
                          strokeWidth="3"
                        />

                        <path
                          d="M-20 130 L80 95 L150 140 L240 90 L320 145 L420 105"
                          fill="none"
                          stroke="#A2B9AE"
                          strokeWidth="3"
                        />

                        <path
                          d="M40 -20 L100 60 L70 200 M220 -20 L190 80 L250 200 M340 -20 L300 70 L370 200"
                          fill="none"
                          stroke="#B7C8C0"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>

                    <div className="relative text-center text-[#0B3C5D]">
                      <span className="text-2xl" aria-hidden="true">
                        ⌖
                      </span>

                      <p className="mt-1 text-xs font-semibold">
                        Facility mapping not connected
                      </p>

                      <p className="mt-1 text-[10px] text-[#526B70]">
                        Awaiting verified facility coordinates
                      </p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-white/90 px-3 py-2 text-[9px] text-[#145C3B]">
                      <span>● GPS mapping pending</span>
                      <span>Facility data unavailable</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </motion.div>
      </section>

      {/* LATEST HEALTH RELEASES */}
      <section className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionHeading>
              LATEST HEALTH RELEASE
            </SectionHeading>

            <button
              type="button"
              onClick={() => navigate("/media")}
              className="mb-6 text-xs font-semibold text-[#1F7A3F] transition-colors hover:underline"
            >
              View all releases →
            </button>
          </div>

          <div id="health-releases">
            <motion.div
              {...motionSettings}
              variants={staggerContainer}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {releases.map((release) => (
                <motion.article
                  key={release.title}
                  variants={revealVariants}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-[0.99] cursor-pointer"
                >
                  <div className="overflow-hidden">
                    <img
                      src={release.image}
                      alt=""
                      loading="lazy"
                      className="h-48 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-[10px] text-gray-500">
                      {release.category}
                    </p>

                    <h3 className="mt-3 text-sm font-semibold leading-6">
                      {release.title}
                    </h3>

                    
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Health;