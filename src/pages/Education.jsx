
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getStates, getIndicators,} from "../api/referenceData.js";
import { apiRequest } from "../api/api.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { motion, useReducedMotion } from "framer-motion";
import { exportData, formatDisplayValue,} from "../utility/exportData.js";
import { getPublishedRecords } from "../api/publishedData.js";
import {
  getMedia,
  subscribeToMedia,
} from "../api/media.js";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";


import EducationHero from "../assets/Education.hero.png";
import civicIntelLogo from "../assets/civicintellogo1.png";
import Education1 from "../assets/education1.png";
import Education2 from "../assets/education2.png";
import Education3 from "../assets/education3.png";



// NATIONAL OVERVIEW INDICATORS

const releases = [
  {
    category: "Education • National",
    title: "WAEC pass rates by state, 2025",
    image: Education2,
  },
  {
    category: "Education • Kano State",
    title: "Out-of-school children estimate update",
    image: Education1,
  },
  {
    category: "Education • National",
    title: "Education budget execution, FY2025",
    image: Education3,
  },
];

// --------------------------------------------------
// Fixed colours for Nigerian states and FCT
// --------------------------------------------------

const yearColorPalette = [
  "#2563EB",
  "#059669",
  "#D97706",
  "#9333EA",
  "#DC2626",
  "#0891B2",
  "#C026D3",
  "#65A30D",
];

function getYearColorRGB(index) {
  const color = yearColorPalette[index % yearColorPalette.length];
  const hex = color.replace("#", "");

  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16),
  ];
}

// const formatNumber = (number) =>
//   new Intl.NumberFormat("en-NG").format(number);

const formatOverviewValue = (record) => {
  if (
    !record ||
    record.value === null ||
    record.value === undefined
  ) {
    return "—";
  }

  const value = Number(record.value);

  if (!Number.isFinite(value)) return "—";

  const formattedValue = formatDisplayValue(
    value,
    record.unit
  );

  if (
    record.unit === "%" ||
    String(record.indicator_key ?? "").endsWith("_pct")
  ) {
    return formattedValue.endsWith("%")
      ? formattedValue
      : `${formattedValue}%`;
  }

  if (record.indicator_key === "primary_pupil_teacher_ratio") {
    return `1:${formattedValue}`;
  }

  if (record.unit === "NGN") {
    return `₦${formatDisplayValue(value)}`;
  }

  return formattedValue;
};

function SectionHeading({ children, dark = false }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <h2
      className={`mb-6 flex items-center gap-2 text-md font-bold sm:text-2xl lg:2xl ${
        dark ? "text-white" : "text-[#20272B]"
      }`}
    >
      <motion.span
        aria-hidden="true"
        className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#1F7A3F]"
        animate={
          shouldReduceMotion
            ? {
                opacity: 1,
                scale: 1,
                boxShadow: "0 0 8px rgba(31, 122, 63, 0.65)",
              }
            : {
                opacity: [1, 0.7, 1],
                scale: [1, 1.15, 1],
                boxShadow: [
                  "0 0 4px rgba(31, 122, 63, 0.4)",
                  "0 0 14px rgba(31, 122, 63, 1)",
                  "0 0 4px rgba(31, 122, 63, 0.4)",
                ],
              }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />
      {children}
    </h2>
  );
}

function Education() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const restoredFilters =
  location.state?.educationFilters ??
  (() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("civicintel_education_filters") || "null"
      );
    } catch {
      return null;
    }
  })();
  
  const shouldReduceMotion = useReducedMotion();

  const stateDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);
 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        stateDropdownRef.current &&
        !stateDropdownRef.current.contains(event.target)
      ) {
        stateDropdownRef.current.removeAttribute("open");
      }

      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target)
      ) {
        yearDropdownRef.current.removeAttribute("open");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  

  useEffect(() => {
    if (location.hash !== "#education-filters") return;

    const filtersSection = document.getElementById("education-filters");

    if (filtersSection) {
      filtersSection.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    }
  }, [location.hash]);

  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [statesError, setStatesError] = useState("");

  const [indicators, setIndicators] = useState([]);
  const [indicatorsLoading, setIndicatorsLoading] = useState(true);
  const [indicatorsError, setIndicatorsError] = useState("");
  const [educationMedia, setEducationMedia] = useState([]);

  // National overview data
  // All published education records, including state-level records
  const [publishedEducationRecords, setPublishedEducationRecords] = useState([]);

  const [nationalOverviewLoading, setNationalOverviewLoading] = useState(true);

  const [nationalOverviewError, setNationalOverviewError] = useState("");
    
 const [indicator, setIndicator] = useState(
   restoredFilters?.indicator ?? "all"
  );

  const [state, setState] = useState(
    restoredFilters?.states ?? []
  );

  const [year, setYear] = useState(
    restoredFilters?.years?.map(String) ??
      (restoredFilters?.year && restoredFilters.year !== "all"
        ? [String(restoredFilters.year)]
        : [])
  );
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(
    restoredFilters
      ? {
          ...restoredFilters,
          years:
          restoredFilters.years?.map(String) ??
          (restoredFilters.year && restoredFilters.year !== "all"
            ? [String(restoredFilters.year)]
            : []),
        }
      : null
  );

  const [educationRecords, setEducationRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const RECORDS_PER_PAGE = 25;

  const motionSettings = {
    initial: shouldReduceMotion ? false : "hidden",
    whileInView: "visible",
    viewport: {
      once: true,
      amount: 0.15,
    },
  };

  const revealVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 24,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.65,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // LOAD STATES
  useEffect(() => {
    let isMounted = true;

    async function loadStates() {
      try {
        const data = await getStates();

        if (isMounted) {
          setStates(data);
        }
      } catch (error) {
        if (isMounted) {
          setStatesError(
            error.message || "Unable to load states."
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

    const educationReleases = educationMedia
    .filter((release) =>
      release.category?.toLowerCase().includes("education")
    )
    .slice(0, 3);

  // LOAD EDUCATION INDICATORS FROM BACKEND
  useEffect(() => {
    let isMounted = true;

    async function loadIndicators() {
      try {
        const data = await getIndicators();

        if (!isMounted) return;

        const educationIndicators = (Array.isArray(data) ? data : [])
          .filter(
            (item) =>
              String(item.sector ?? "").toLowerCase() === "education"
          )
          .sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
          );

        setIndicators(educationIndicators);
        setIndicatorsError("");
      } catch (error) {
        if (isMounted) {
          setIndicatorsError(
            error.message || "Unable to load education indicators."
          );
        }
      } finally {
        if (isMounted) {
          setIndicatorsLoading(false);
        }
      }
    }

    loadIndicators();

    return () => {
      isMounted = false;
    };
  }, []);

  // LOAD ALL PUBLISHED EDUCATION RECORDS
  // Public request: no login is required to view these summaries.
  useEffect(() => {
    let isMounted = true;

    async function loadNationalEducationData() {
      try {
        const batchSize = 100;

        const firstResponse = await getPublishedRecords({
          sector: "education",
          limit: batchSize,
          offset: 0,
        });

        const total = Number(firstResponse?.total) || 0;

        let allRecords = Array.isArray(firstResponse?.items)
          ? [...firstResponse.items]
          : [];

        for (
          let offset = batchSize;
          offset < total;
          offset += batchSize
        ) {
          const response = await getPublishedRecords({
            sector: "education",
            limit: batchSize,
            offset,
          });

          const items = Array.isArray(response?.items)
            ? response.items
            : [];

          allRecords.push(...items);
        }

        if (!isMounted) return;

        // Keep all education records so both the national overview
        // and the state-level SSCE chart can use the same API response.
        const educationOnly = allRecords.filter(
          (record) => record.sector === "education"
        );

        setPublishedEducationRecords(educationOnly);
      } catch (error) {
        if (isMounted) {
          setNationalOverviewError(
            error.message ||
              "Unable to load published education data."
          );
        }
      } finally {
        if (isMounted) {
          setNationalOverviewLoading(false);
        }
      }
    }

    loadNationalEducationData();

    return () => {
      isMounted = false;
    };
  }, []);

  // LOAD EDUCATION MEDIA RELEASES
  useEffect(() => {
    let isMounted = true;

    function updateEducationMedia(response) {
      if (!isMounted || !Array.isArray(response?.items)) {
        return;
      }

      setEducationMedia(response.items);
    }

    // Listen for refreshed articles.
    const unsubscribe = subscribeToMedia(updateEducationMedia);

    async function loadEducationMedia() {
      try {
        const response = await getMedia({
          limit: 20,
          offset: 0,
        });

        updateEducationMedia(response);
      } catch (error) {
        console.error(
          "Failed to load education media reports:",
          error
        );
      }
    }

    loadEducationMedia();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  

  // INDICATORS PROVIDED BY THE BACKEND
  const availableIndicators = useMemo(() => {
    return indicators.map((item) => ({
      key: item.key,
      label: item.name || item.key,
    }));
  }, [indicators]);

  // YEARS PROVIDED BY THE BACKEND
  const availableYears = useMemo(() => {
    return [
      ...new Set(
        publishedEducationRecords
          .map((record) => Number(record.year))
          .filter((year) => Number.isFinite(year))
      ),
    ].sort((a, b) => b - a);
  }, [publishedEducationRecords]);



  // CALCULATE THE LATEST AVAILABLE STATE AVERAGE
  const nationalOverviewStats = useMemo(() => {
    const overviewIndicatorKeys = [
      "primary_net_enrolment_pct",
      "primary_completion_pct",
      "adult_literacy_pct",
      "out_of_school_children_pct",
      "primary_pupil_teacher_ratio",
    ];

    return overviewIndicatorKeys.map((indicatorKey) => {
      const indicator = availableIndicators.find(
        (item) => item.key === indicatorKey
      );

      if (!indicator) {
        return {
          key: indicatorKey,
          label: indicatorKey,
          value: "—",
          year: null,
          stateCount: 0,
        };
      }

      const matchingRecords = publishedEducationRecords.filter(
        (record) => record.indicator_key === indicatorKey
      );

      const stateRecords = matchingRecords.filter((record) => {
        const stateName = String(record.state ?? "")
          .trim()
          .toLowerCase();

        return (
          stateName &&
          !["national", "nigeria"].includes(stateName) &&
          Number.isFinite(Number(record.value)) &&
          Number.isFinite(Number(record.year))
        );
      });

      if (stateRecords.length === 0) {
        return {
          key: indicatorKey,
          label: indicator.label,
          value: "—",
          year: null,
          stateCount: 0,
        };
      }

      const latestYear = Math.max(
        ...stateRecords.map((record) => Number(record.year))
      );

      const latestYearRecords = stateRecords.filter(
        (record) => Number(record.year) === latestYear
      );

      const recordsByState = new Map();

      latestYearRecords.forEach((record) => {
        const stateName = String(record.state)
          .trim()
          .toLowerCase();

        if (!recordsByState.has(stateName)) {
          recordsByState.set(stateName, record);
        }
      });

      const comparableRecords = [...recordsByState.values()];

      const average =
        comparableRecords.reduce(
          (total, record) => total + Number(record.value),
          0
        ) / comparableRecords.length;

      const averageRecord = {
        value: average,
        unit: comparableRecords[0]?.unit,
        indicator_key: indicatorKey,
      };

      return {
        key: indicatorKey,
        label: indicator.label,
        value: formatOverviewValue(averageRecord),
        year: latestYear,
        stateCount: comparableRecords.length,
      };
    });
  }, [availableIndicators, publishedEducationRecords]);


  // SSCE PERFORMANCE OVERVIEW
  // Uses the latest available SSCE record for each state.
  
  const ssceStateRecords = useMemo(() => {
    const latestByState = new Map();

    publishedEducationRecords.forEach((record) => {
      if (
        record.indicator_key !== "ssce_5_credits_pct" ||
        record.unit !== "%"
      ) {
        return;
      }

      const stateName = String(record.state ?? "").trim();
      const normalizedState = stateName.toLowerCase();
      const value = Number(record.value);
      const recordYear = Number(record.year) || 0;

      // Exclude national-level records.
      if (
        !stateName ||
        ["national", "nigeria"].includes(normalizedState)
      ) {
        return;
      }

      // Ignore invalid percentage values.
      if (
        !Number.isFinite(value) ||
        value < 0 ||
        value > 100
      ) {
        return;
      }

      const existingRecord = latestByState.get(normalizedState);

      if (
        !existingRecord ||
        recordYear > (Number(existingRecord.year) || 0)
      ) {
        latestByState.set(normalizedState, record);
      }
    });

    return [...latestByState.values()]
      .map((record) => ({
        state: record.state,
        value: Number(record.value),
        year: record.year,
        unit: record.unit,
        dataset_id: record.dataset_id,
      }))
      .sort((a, b) => b.value - a.value);
  }, [publishedEducationRecords]);

  const topSsceStates = ssceStateRecords.slice(0, 10);

  const ssceLatestYear = useMemo(() => {
    if (ssceStateRecords.length === 0) return null;

    return Math.max(
      ...ssceStateRecords.map((record) => Number(record.year) || 0)
    );
  }, [ssceStateRecords]);

  const ssceDatasetCount = useMemo(() => {
    return new Set(
      ssceStateRecords
        .map((record) => record.dataset_id)
        .filter(Boolean)
    ).size;
  }, [ssceStateRecords]);

  const requireLogin = (action) => {
    if (isLoggedIn) return true;

    navigate("/login", {
      state: {
        from: {
          pathname: "/education",
        },
        message: `Please log in to ${action}.`,
      },
    });

    return false;
  };

  const handleSignup = () => {
    navigate("/signup", {
      state: {
        from: {
          pathname: "/education",
          hash: "#education-filters",
          state: {
            educationFilters: {
              indicator,
              states: state,
              years: year,
            },
          },
        },
      },
    });
  };

  const selectedIndicatorLabel =
  availableIndicators.find(
    (item) => item.key === appliedFilters?.indicator
  )?.label ?? "Education Records";

  const recordEducationExport = async (format, exportedRecords) => {
    if (!isLoggedIn || !appliedFilters || exportedRecords.length === 0) {
      return false;
    }

    const exportedStates = [
      ...new Set(
        exportedRecords
          .map((record) => record.state)
          .filter(Boolean)
      ),
    ];

    const exportedYears = [
      ...new Set(
        exportedRecords
          .map((record) => Number(record.year))
          .filter(Number.isFinite)
      ),
    ].sort((a, b) => a - b);

    const yearLabel =
      exportedYears.length === 0
        ? "Year unavailable"
        : exportedYears.length === 1
          ? String(exportedYears[0])
          : `${exportedYears[0]}–${exportedYears[exportedYears.length - 1]}`;

    const payload = {
      format,
      title: `Education — ${selectedIndicatorLabel}`,
      subtitle: `${exportedStates.length === 0 ? "No state specified" : exportedStates.length === 1 ? exportedStates[0] : "Selected states"} · ${yearLabel}`,
      indicator: appliedFilters.indicator,
      states: exportedStates,
      years: exportedYears,
    };

    try {
      await apiRequest("/exports", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return true;
    } catch (error) {
      console.error("Could not record Education export:", error);

      window.alert(
        "Your file was exported, but CivicIntel could not save it to Recent Exports."
      );

      return false;
    }
  };

  // LOAD FILTERED EDUCATION RECORDS AFTER LOGIN AND APPLY
  useEffect(() => {
    if (!isLoggedIn || !appliedFilters) return;

    let isMounted = true;

    async function loadEducationRecords() {
      try {
        const batchSize = 100;

        const firstResponse = await getPublishedRecords({
          sector: "education",
          indicator: appliedFilters.indicator,
          limit: batchSize,
          offset: 0,
        });

        const total = Number(firstResponse?.total) || 0;

        let allRecords = Array.isArray(firstResponse?.items)
          ? [...firstResponse.items]
          : [];

        for (
          let offset = batchSize;
          offset < total;
          offset += batchSize
        ) {
          const response = await getPublishedRecords({
            sector: "education",
            indicator: appliedFilters.indicator,
            limit: batchSize,
            offset,
          });

          const items = Array.isArray(response?.items)
            ? response.items
            : [];

          allRecords.push(...items);
        }

        if (!isMounted) return;

        const educationOnly = allRecords.filter((item) => {
          const matchesSector = item.sector === "education";

          const matchesState =
            appliedFilters.states.length === 0 ||
            appliedFilters.states.includes(item.state);

          const matchesYear =
            appliedFilters.years.length === 0 ||
            appliedFilters.years.includes(String(item.year));

          return matchesSector && matchesState && matchesYear;
        });

        setEducationRecords(educationOnly);
        setCurrentPage(0);
        setRecordsError("");
      } catch (error) {
        if (isMounted) {
          setRecordsError(
            error.message ||
              "Unable to load education records."
          );

          setEducationRecords([]);
        }
      } finally {
        if (isMounted) {
          setRecordsLoading(false);
        }
      }
    }

    loadEducationRecords();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, appliedFilters, retryCount]);

  // SEARCH FETCHED EDUCATION RECORDS
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return educationRecords;
    }

    return educationRecords.filter((record) =>
      Object.values(record).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [educationRecords, search]);


  // PAGINATE FILTERED EDUCATION RECORDS
  const totalPages = Math.ceil(
    filteredRecords.length / RECORDS_PER_PAGE
  );

  const paginatedRecords = useMemo(() => {
    const startIndex = currentPage * RECORDS_PER_PAGE;

    return filteredRecords.slice(
      startIndex,
      startIndex + RECORDS_PER_PAGE
    );
  }, [filteredRecords, currentPage]);

  
  

  const handleApplyFilters = (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: {
            pathname: "/education",
            hash: "#education-filters",
            state: {
              educationFilters: {
                indicator,
                states: state,
                years: year,
              },
            },
          },
          message: "Please log in to apply education indicators.",
        },
      });

      return;
    }

      const filters = {
        indicator,
        states: state,
        years: year,
      };

      sessionStorage.setItem(
        "civicintel_education_filters",
        JSON.stringify(filters)
      );

      setSearch("");
      setCurrentPage(0);
      setEducationRecords([]);
      setRecordsError("");
      setRecordsLoading(true);
      setShowExportOptions(false);

      setAppliedFilters(filters);
  };



  const handleExport = async (format) => {
    if (!requireLogin("export education data")) return;

    if (!appliedFilters) {
      alert("Please apply your filters before exporting data.");
      return;
    }

    try {
      const firstResponse = await getPublishedRecords({
        sector: "education",
        indicator: appliedFilters.indicator,
        limit: 100,
        offset: 0,
      });

      const allRecords = Array.isArray(firstResponse?.items)
        ? firstResponse.items.filter(
            (item) => item.sector === "education"
          )
        : [];

      const total =
        Number(firstResponse?.total) || allRecords.length;

      for (let offset = 100; offset < total; offset += 100) {
        const response = await getPublishedRecords({
          sector: "education",
          indicator: appliedFilters.indicator,
          limit: 100,
          offset,
        });

        const items = Array.isArray(response?.items)
          ? response.items.filter(
              (item) => item.sector === "education"
            )
          : [];

        allRecords.push(...items);
      }

      const query = search.trim().toLowerCase();

      const matchingRecords = allRecords.filter((record) => {
        const matchesState =
          appliedFilters.states.length === 0 ||
          appliedFilters.states.includes(record.state);

        const matchesYear =
          appliedFilters.years.length === 0 ||
          appliedFilters.years.includes(String(record.year));

        const matchesSearch = Object.values(record).some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

        return matchesState && matchesYear && matchesSearch;
      });

      if (matchingRecords.length === 0) {
        alert("There are no matching records to export.");
        return;
      }

      const headers = [
        "State",
        "Indicator",
        "Value",
        "Year",
      ];

      const rows = matchingRecords.map((record) => ({
        State: record.state,
        Indicator: record.indicator,
        Value:
          record.unit === "NGN"
            ? `₦${formatDisplayValue(record.value)}`
            : formatDisplayValue(record.value, record.unit),
        Year: record.year,
      }));

      // Prepare chart data for the PDF export.
      // Skip the chart when all indicators are selected because
      // different indicators may use different units.
      const chartData =
        appliedFilters.indicator === "all"
          ? []
          : [
              ...new Set(
                matchingRecords
                  .map((record) => Number(record.year))
                  .filter(Number.isFinite)
              ),
            ]
              .sort((a, b) => a - b)
              .map((year, yearIndex) => {
                const recordsByState = new Map();

                matchingRecords
                  .filter(
                    (record) => Number(record.year) === year
                  )
                  .forEach((record) => {
                    const stateName = String(record.state ?? "").trim();
                    const normalizedState = stateName.toLowerCase();
                    const value = Number(record.value);

                    if (
                      !stateName ||
                      ["national", "nigeria"].includes(normalizedState) ||
                      !Number.isFinite(value)
                    ) {
                      return;
                    }

                    recordsByState.set(normalizedState, {
                      state: stateName,
                      value,
                      color: getYearColorRGB(yearIndex),
                    });
                  });

                return {
                  year,
                  rows: [...recordsByState.values()],
                };
              })
              .filter((period) => period.rows.length > 0);

      exportData({
        format,
        headers,
        rows,
        fileName: `civic-intel-education-${
          appliedFilters.years.length > 0
            ? appliedFilters.years.join("-")
            : "all-years"
        }`,
        title: "CivicIntel - Education Data",
        subtitle: selectedIndicatorLabel,

          chartData,
          chartTitle:
            appliedFilters.indicator === "all"
              ? ""
              : `${selectedIndicatorLabel} by State and Year`,
          chartUnit:
            matchingRecords.find(
              (record) => record.unit
            )?.unit ?? "",

           chartColors: [
            [31, 122, 63], // #1F7A3F — Education green
          ],

          metadata: {
          Year:
            appliedFilters.years.length === 0
              ? "All available years"
              : appliedFilters.years.join(", "),
          State:
            appliedFilters.states.length === 0
              ? "All states"
              : appliedFilters.states.join(", "),
          "Data status": "Published backend records",
        },
        landscape: true,
      });
      await recordEducationExport(format, matchingRecords);
      
    } catch (error) {
      alert(
        error.message || "Unable to export education data."
      );
    }
  };

  return (
    <main className="bg-[#E7EDF0] text-[#20272B]">
      {/* HERO */}
      <motion.section
        {...motionSettings}
        variants={revealVariants}
        className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-26 pb-16 sm:px-8 sm:pt-36 sm:pb-12 md:min-h-0 md:grid-cols-2 md:gap-8 md:px-8 md:pt-30 md:pb-12 lg:min-h-92.5 lg:gap-10 lg:px-12 lg:py-24"
      >
        <motion.div
          className="order-2 md:order-1"
          initial={
            shouldReduceMotion
              ? false
              : { opacity: 0, y: 30 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#1F7A3F]">
            Nigeria · Education data
          </p>

          <h1 className="max-w-xl text-3xl font-bold leading-tight text-[#0B3C5D] sm:text-4xl lg:text-5xl">
            Nigeria&apos;s{" "}
            <span className="text-[#1F7A3F]">Education</span>{" "}
            indicators, by state and over time
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-[#38464D]">
            Explore enrolment, completion, learning outcomes,
            teachers, examinations, infrastructure, and financing with figures traceable to their sources.
          </p>
        </motion.div>

        <motion.div
          className="order-1 flex justify-center md:order-2 md:justify-end"
          initial={
            shouldReduceMotion
              ? false
              : { opacity: 0, scale: 0.92 }
          }
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.85,
            delay: shouldReduceMotion ? 0 : 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="relative h-64 w-full max-w-xs rounded-bl-[80px] rounded-tr-[80px] bg-[#0B3C5D] sm:h-80 md:h-82.5 lg:h-120.25 lg:max-w-md">
            <img
              src={EducationHero}
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

      

      {/* NATIONAL EDUCATION OVERVIEW - LIVE BACKEND DATA */}
      <motion.section
        {...motionSettings}
        variants={revealVariants}
        className="bg-[#B5C7D1] px-5 py-8 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          <SectionHeading>
            NATIONAL EDUCATION OVERVIEW
          </SectionHeading>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {nationalOverviewStats.map((stat, index) => (
              <article
                key={stat.key}
                tabIndex={0}
                className="group relative min-h-28 cursor-pointer overflow-hidden rounded-md border border-transparent border-l-4 bg-[#F0F1F0] p-3.5 shadow-sm transform-gpu transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-[#1F7A3F] hover:shadow-xl active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A3F] motion-reduce:transform-none motion-reduce:transition-none"
                style={{
                  borderLeftColor: [
                    "#1F7A3F",
                    "#8B2922",
                    "#145C3B",
                    "#0B3C5D",
                    "#D6A400",
                  ][index % 5],
                  transitionDelay: `${index * 40}ms`,
                }}
              >
                <span
                  className="inline-block rounded-full bg-[#0B3C5D] px-3 py-1 text-[9px] font-medium text-white"
                >
                  {stat.label}
                </span>

                <p className="mt-3 text-lg font-bold text-[#1F7A3F]">
                  {nationalOverviewLoading ? (
                    <span className="inline-block h-5 w-16 animate-pulse rounded bg-gray-300" />
                  ) : (
                    stat.value
                  )}
                </p>

                <p className="mt-1 text-xs leading-5">
                  State average
                </p>

                <div className="my-2 border-t border-dashed border-gray-400" />

                <p className="text-[10px] text-gray-600">
                  {nationalOverviewLoading
                    ? "Loading published data..."
                    : stat.year
                      ? `${stat.year} • ${stat.stateCount} states`
                      : "No state records available"}
                </p>
              </article>
            ))}
          </div>

          {nationalOverviewError ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-red-50 p-3 text-xs text-red-700">
              <p>
                Unable to load national education figures:{" "}
                {nationalOverviewError}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="font-semibold underline"
              >
                Reload page
              </button>
            </div>
          ) : (
            <p className="mt-4 text-xs text-gray-700">
              Figures are drawn from the latest available published
              education records. 
             
            </p>
          )}
        </div>
      </motion.section>

      {/* EDUCATION INDICATOR FILTERS */}
      <motion.section
        id="education-filters"
        {...motionSettings}
        variants={revealVariants}
        className="px-5 py-8 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          <SectionHeading>EDUCATION INDICATOR</SectionHeading>

          <form onSubmit={handleApplyFilters}>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-2 text-xs">
                <div className="flex min-h-8 flex-col justify-end">
                  <span>Indicator</span>
                </div>

                <div className="relative">
                  <select
                    value={indicator}
                    onChange={(event) => setIndicator(event.target.value)}
                    disabled={indicatorsLoading}
                    className="w-full appearance-none rounded-xl border border-[#B7C5CB] bg-[#B5C7D1] px-3 py-3 pr-10 text-sm outline-none focus:border-[#1F7A3F] disabled:cursor-wait disabled:opacity-60"
                  >
                    {/* KEEP ALL YOUR EXISTING OPTIONS HERE */}
                  
                    <option value="all">All Education Indicators</option>

                    {indicatorsLoading ? (
                      <option value="" disabled>
                        Loading indicators...
                      </option>
                    ) : indicators.length > 0 ? (
                      indicators.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.name || item.key}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No education indicators available
                      </option>
                    )}
                  </select>

                  <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />
                </div>

                {indicatorsError && (
                  <p className="mt-1 text-xs text-red-600">
                    Unable to load indicators: {indicatorsError}
                  </p>
                )}
              </label>

              <label className="flex flex-col gap-2 text-xs">
                <div className="flex min-h-8 flex-col justify-end">
                  <span>State</span>
                  <span>Select single or multiple states</span>
                </div>

                <details ref={stateDropdownRef} className="relative">
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-[#B7C5CB] bg-[#B5C7D1] px-3 py-3 text-sm">
                    <span>
                      {state.length === 0
                        ? "All states"
                        : `${state.length} state${state.length > 1 ? "s" : ""} selected`}
                    </span>

                    <ChevronDown
                      size={16}
                      className="shrink-0 text-slate-600"
                    />
                  </summary>

                  <div className="absolute left-0 z-30 mt-2 max-h-64 w-full min-w-48 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 text-[#20272B] shadow-xl">
                    <label className="flex cursor-pointer items-center gap-2 border-b border-gray-100 pb-2 text-sm">
                      <input
                        type="checkbox"
                        checked={state.length === 0}
                        onChange={() => setState([])}
                      />
                      All states
                    </label>

                    {states.map((item) => (
                      <label
                        key={item.id ?? item.name}
                        className="flex cursor-pointer items-center gap-2 py-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={state.includes(item.name)}
                          onChange={(event) =>
                            setState((previous) =>
                              event.target.checked
                                ? [...previous, item.name]
                                : previous.filter((name) => name !== item.name)
                            )
                          }
                        />
                        {item.name}
                      </label>
                    ))}
                  </div>
                </details>

                {statesLoading && (
                  <p className="text-xs text-gray-500">
                    Loading available states...
                  </p>
                )}

                {!statesLoading && states.length === 0 && !statesError && (
                  <p className="text-xs text-gray-500">
                    No states available.
                  </p>
                )}

                {statesError && (
                  <p className="mt-1 text-xs text-red-600">
                    Unable to load states: {statesError}
                  </p>
                )}
              </label>

              <label className="flex flex-col gap-2 text-xs">
                <div className="flex min-h-8 flex-col justify-end">
                  <span>Year</span>
                  <span>Select single or multiple years</span>
                </div>

                <details ref={yearDropdownRef} className="relative">
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-[#B7C5CB] bg-[#B5C7D1] px-3 py-3 text-sm">
                    <span>
                      {year.length === 0
                        ? "All available years"
                        : `${year.length} year${year.length > 1 ? "s" : ""} selected`}
                    </span>

                    <ChevronDown
                      size={16}
                      className="shrink-0 text-slate-600"
                    />
                  </summary>

                  <div className="absolute left-0 z-30 mt-2 max-h-64 w-full min-w-48 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 text-[#20272B] shadow-xl">
                    <label className="flex cursor-pointer items-center gap-2 border-b border-gray-100 pb-2 text-sm">
                      <input
                        type="checkbox"
                        checked={year.length === 0}
                        onChange={() => setYear([])}
                      />

                      All available years
                    </label>

                    {availableYears.map((availableYear) => {
                      const yearValue = String(availableYear);

                      return (
                        <label
                          key={availableYear}
                          className="flex cursor-pointer items-center gap-2 py-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={year.includes(yearValue)}
                            onChange={(event) =>
                              setYear((previous) =>
                                event.target.checked
                                  ? [...previous, yearValue]
                                  : previous.filter(
                                      (selectedYear) => selectedYear !== yearValue
                                    )
                              )
                            }
                          />

                          {availableYear}
                        </label>
                      );
                    })}
                  </div>
                </details>
              </label>
            </div>

            <button
              type="submit"
              className="mx-auto mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176331] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3C5D] md:w-1/2"
            >
              Apply <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>
      </motion.section>
      

      {/* PROTECTED EDUCATION DASHBOARD */}
      <motion.section
        {...motionSettings}
        variants={revealVariants}
        className="scroll-mt-24 rounded-md bg-[#061D2A] px-4 py-8 text-white sm:px-6 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          {!isLoggedIn ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-8 text-center sm:p-10">
              <h2 className="mt-4 text-xl font-bold sm:text-2xl">
                Unlock Education Data Analysis
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/70">
                Log in to apply education indicators, view state-level
                cohort records, search the dataset, and export your
                results.
              </p>

              <button
                type="button"
                onClick={() =>
                  requireLogin("view education data analysis")
                }
                className="mt-6 rounded-full bg-[#1F7A3F] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#176331] active:scale-[0.98]"
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
          ) : !appliedFilters ? (
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center">
              <h2 className="text-xl font-bold">
                Your Education Analysis
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/70">
                Choose an indicator, state, and year above, then click
                Apply to view your filtered education records.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold sm:text-2xl">
                    {selectedIndicatorLabel}
                  </h2>

                  <p className="mt-2 text-xs text-white/70">
                    Selected states:{" "}
                    {appliedFilters.states.length === 0
                      ? "All states"
                      : appliedFilters.states.join(", ")}
                    {" · "}
                    Selected years:{" "}
                    {appliedFilters.years.length === 0
                      ? "All available years"
                      : appliedFilters.years.join(", ")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setShowFilters((previous) => !previous)
                    }
                    aria-expanded={showFilters}
                    className="rounded-full bg-white px-6 py-2 text-xs font-semibold text-[#1F7A3F] transition hover:bg-gray-100 active:scale-[0.98]"
                  >
                    {showFilters ? "Hide search" : "Search records"} ☰
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          !requireLogin("export education data")
                        ) {
                          return;
                        }

                        setShowExportOptions((previous) => !previous);
                      }}
                      aria-expanded={showExportOptions}
                      aria-haspopup="true"
                      className="inline-flex items-center gap-3 rounded-full bg-[#1F7A3F] px-6 py-2 text-xs font-semibold text-white transition hover:bg-[#176331] active:scale-[0.98]"
                    >
                      Export

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className={`h-4 w-4 transition-transform ${
                          showExportOptions ? "rotate-180" : ""
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

                    {showExportOptions && (
                      <div
                        role="menu"
                        className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 text-[#20272B] shadow-xl"
                      >
                        {[
                          { label: "Export as CSV", format: "csv" },
                          { label: "Export as PDF", format: "pdf" },
                          { label: "Export as XLSX", format: "xlsx" },
                        ].map((option) => (
                          <button
                            key={option.format}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              handleExport(option.format);
                              setShowExportOptions(false);
                            }}
                            className="block w-full px-4 py-3 text-left text-sm transition hover:bg-[#E7EDF0] hover:text-[#1F7A3F]"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {showFilters && (
                <div className="mb-4 rounded-lg border border-white/15 bg-white/5 p-4">
                  <label className="block text-xs text-white/70">
                    Search state

                    <input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setCurrentPage(0);
                      }}
                      placeholder="Search state, indicator, value, year..."
                      className="mt-2 w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-sm text-[#20272B] outline-none focus:border-[#1F7A3F] sm:max-w-sm"
                    />
                  </label>
                </div>
              )}

              {recordsLoading ? (
                <div className="rounded-xl border border-white/15 bg-white/5 p-8 text-center">
                  <p className="text-sm text-white/80">
                    Loading education records...
                  </p>
                </div>
              ) : recordsError ? (
                <div className="rounded-xl border border-red-300/30 bg-red-300/10 p-5">
                  <h3 className="font-semibold text-red-200">
                    Unable to load education records
                  </h3>

                  <p className="mt-2 text-sm text-white/75">
                    {recordsError}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setRecordsError("");
                      setRecordsLoading(true);
                      setRetryCount((count) => count + 1);
                    }}
                    className="mt-4 rounded-full bg-white px-5 py-2 text-xs font-semibold text-[#0B3C5D]"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-sm bg-gray-200 px-2 py-1 text-[10px] text-gray-700">
                      Showing {paginatedRecords.length} of{" "}
                      {filteredRecords.length} matching records
                    </span>

                    <span className="text-[10px] text-green-300">
                      Published education records
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-sm">
                    
                    <table className="w-full min-w-212.5 border-collapse bg-[#FFFBEF] text-left text-[#20272B]">
                      <thead className="bg-[#E5EBEE] text-[10px] uppercase">
                        <tr>
                          <th className="px-4 py-4">State</th>
                          <th className="px-4 py-4">Indicator</th>
                          <th className="px-4 py-4 text-right">Value</th>
                          <th className="px-4 py-4 text-right">Year</th>
                        </tr>
                      </thead>

                      <tbody>
                        {paginatedRecords.length > 0 ? (
                          paginatedRecords.map((record, index) => (
                            <tr
                              key={`${record.state}-${record.indicator_key}-${record.year}-${index}`}
                              className="border-b border-[#B7C7CF] text-xs transition-colors hover:bg-[#F4F0E3]"
                            >
                              <td className="px-4 py-4 font-semibold">
                                {record.state}
                              </td>

                              <td className="px-4 py-4">
                                {record.indicator ||
                                  availableIndicators.find(
                                    (item) => item.key === record.indicator_key
                                  )?.label ||
                                  record.indicator_key}
                              </td>

                              <td className="px-4 py-4 text-right font-semibold tabular-nums">
                                {record.unit === "NGN"
                                  ? `₦${formatDisplayValue(record.value)}`
                                  : formatDisplayValue(record.value, record.unit)}
                              </td>

                              <td className="px-4 py-4 text-right">
                                {record.year}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-8 text-center text-sm text-gray-500"
                            >
                              No matching records found. Try another filter or search term.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION */}
                  <div
                    className="mt-5 flex flex-wrap items-center justify-between gap-4"
                  >
                    <p className="text-xs text-white/70">
                      Page {totalPages === 0 ? 0 : currentPage + 1}{" "}
                      of {totalPages}
                    </p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={
                          currentPage === 0 || recordsLoading
                        }
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.max(0, page - 1)
                          )
                        }
                        className="rounded-full border border-white/30 px-5 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        disabled={
                          currentPage >= totalPages - 1 ||
                          recordsLoading ||
                          totalPages === 0
                        }
                        onClick={() =>
                          setCurrentPage((page) => page + 1)
                        }
                        className="rounded-full bg-[#1F7A3F] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#176331] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 bg-[#E5EBEE] p-4 text-[#0B3C5D]">
                    <p className="text-xs font-bold">
                      Dataset Transparency &amp; Rigour Declaration
                    </p>

                    <p className="mt-2 text-[10px] leading-5">
                      Source: Published CivicIntel education datasets
                      <br />
                      Dataset IDs: Provided by the backend
                      <br />
                      Reporting year: Based on the selected records
                      <br />
                      Verification: Refer to the associated dataset
                      methodology
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.section>

       {/* LIVE SSCE PERFORMANCE OVERVIEW */}
      <motion.section
        {...motionSettings}
        variants={revealVariants}
        className="px-5 py-8 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          <SectionHeading>
            EXAMINATION PERFORMANCE OVERVIEW
          </SectionHeading>

          <div className="grid gap-5 lg:grid-cols-[2.2fr_0.8fr]">
            {/* SSCE STATE PERFORMANCE */}
            <div className="rounded-lg bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#0B3C5D]">
                    SSCE Performance by State
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Candidates with five or more credits, including
                    English and Mathematics.
                  </p>
                </div>

                <span className="rounded-full bg-[#E8F2EB] px-3 py-1 text-[10px] font-semibold text-[#1F7A3F]">
                  Live published data
                </span>
              </div>

              {nationalOverviewLoading ? (
            <div className="py-10 text-center text-xs text-gray-500">
              Loading SSCE performance data...
            </div>
          ) : topSsceStates.length > 0 ? (
            <>
              <div className="mt-5 h-85 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topSsceStates}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 10 }}
                    />

                    <YAxis
                      type="category"
                      dataKey="state"
                      width={85}
                      tick={{ fontSize: 10 }}
                    />

                    <Tooltip
                      formatter={(value) => [
                        formatDisplayValue(value, "%"),
                        "SSCE performance",
                      ]}
                    />

                    <Bar
                      dataKey="value"
                      name="SSCE performance"
                      fill="#1F7A3F"
                      radius={[0, 5, 5, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="mt-5 border-t border-gray-200 pt-3 text-[10px] leading-5 text-gray-500">
                Showing the top 10 states ranked by their latest available
                published SSCE performance records. Hover over a bar to view
                the value and reporting year.
              </p>
            </>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-[#0B3C5D]">
                No SSCE records available
              </p>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                There are no published records matching the SSCE 5+ credits indicator.
              </p>
            </div>
          )}
            </div>

            {/* SSCE DATA METADATA */}
            <aside className="rounded-lg bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-[#0B3C5D]">
                Dataset Metadata &amp; Audit
              </p>

              <div className="mt-5 space-y-5 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">
                    Indicator
                  </span>

                  <span className="max-w-[55%] text-right font-semibold">
                    SSCE 5+ credits
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">
                    Reporting year
                  </span>

                  <span className="text-right font-semibold">
                    {nationalOverviewLoading
                      ? "Loading..."
                      : ssceLatestYear ?? "Not available"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">
                    States with records
                  </span>

                  <span className="text-right font-semibold">
                    {nationalOverviewLoading
                      ? "..."
                      : ssceStateRecords.length}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">
                    Dataset IDs
                  </span>

                  <span className="text-right font-semibold">
                    {nationalOverviewLoading
                      ? "..."
                      : ssceDatasetCount}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">
                    Data source
                  </span>

                  <span className="max-w-[55%] text-right font-semibold">
                    Published CivicIntel records
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-200 pt-4">
                <p className="text-[10px] leading-5 text-gray-500">
                  Indicator definition: percentage of candidates
                  achieving at least five SSCE credits, including
                  English and Mathematics.
                </p>

                
              </div>
            </aside>
          </div>
        </div>
      </motion.section>

      {/* LATEST EDUCATION RELEASES */}
      <motion.section
        {...motionSettings}
        variants={revealVariants}
        className="px-5 py-10 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionHeading>
              LATEST EDUCATION RELEASE
            </SectionHeading>

            <button
              type="button"
              onClick={() => navigate("/media")}
              className="mb-6 text-xs font-semibold text-[#1F7A3F] transition-colors hover:underline"
            >
              View all releases →
            </button>
          </div>

          <div
            id="education-releases"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[...educationReleases, ...releases]
            .slice(0, 3)
            .map((release) => (
              <Link
                to={
                  release.id
                    ? `/media/${release.id}`
                    : "/media"
                }
                key={release.id || release.title}
                className="block"
              >
                <article className="group h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-[0.99]">
                  <div className="overflow-hidden">
                    <img
                      src={
                        release.image_url
                        ? `https://backend-production-91cb.up.railway.app${release.image_url}`
                        : release.image
                      }
                      alt={release.title || ""}
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
                </article>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>
    </main>
  );
}

export default Education;
