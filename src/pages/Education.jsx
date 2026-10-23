
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import EducationHero from "../assets/Education.hero.png";
import civicIntelLogo from "../assets/civicintellogo1.png";
import Education1 from "../assets/education1.png";
import Education2 from "../assets/education2.png";
import Education3 from "../assets/education3.png";

const overviewStats = [
  {
    label: "ENROLMENT",
    value: "68.2%",
    description: "Net Primary enrolment rate",
    source: "NBS/UBEC • 2022",
    color: "#1F7A3F",
  },
  {
    label: "COMPLETION",
    value: "512",
    description: "Primary completion rate",
    source: "NBS/UBEC • 2022",
    color: "#8B2922",
  },
  {
    label: "OUTCOMES",
    value: "41%",
    description: "Learning proficiency, grade 4 literacy",
    source: "NLEA • 2023",
    color: "#145C3B",
  },
  {
    label: "TEACHERS",
    value: "1:38",
    description: "Teacher-pupil ratio, primary",
    source: "FME • 2022",
    color: "#0B3C5D",
  },
  {
    label: "FINANCING",
    value: "7.9%",
    description: "Education share of state budget",
    source: "BudgIT • 2025",
    color: "#D6A400",
  },
];

// DEMONSTRATION DATA ONLY.
// Verify every figure and source before publication.
const examSummaries = {
  WAEC: [
    { state: "Lagos State", value: 84.2 },
    { state: "Ekiti State", value: 78.5 },
    { state: "Kaduna State", value: 62.1 },
    { state: "Kano State", value: 54.8 },
  ],
  NECO: [
    { state: "Lagos State", value: 79.4 },
    { state: "Ekiti State", value: 75.2 },
    { state: "Kaduna State", value: 65.1 },
    { state: "Kano State", value: 57.3 },
  ],
  JAMB: [
    { state: "Lagos State", value: 72.8 },
    { state: "Ekiti State", value: 68.4 },
    { state: "Kaduna State", value: 59.7 },
    { state: "Kano State", value: 51.6 },
  ],
};

const cohortRecords = [
  {
    state: "Lagos State",
    zone: "SW",
    region: "South West Region",
    candidates: 142390,
    passRate: 81.4,
    malePass: 80.2,
    femalePass: 82.6,
    source: "WAEC Official 2023",
  },
  {
    state: "Edo State",
    zone: "SS",
    region: "South South Region",
    candidates: 58120,
    passRate: 77.2,
    malePass: 76.8,
    femalePass: 77.6,
    source: "WAEC Official 2023",
  },
  {
    state: "Anambra State",
    zone: "SE",
    region: "South East Region",
    candidates: 62800,
    passRate: 74.8,
    malePass: 73.1,
    femalePass: 76.5,
    source: "WAEC Official 2023",
  },
  {
    state: "Kaduna State",
    zone: "NW",
    region: "North West Region",
    candidates: 89450,
    passRate: 52.1,
    malePass: 54.2,
    femalePass: 50.0,
    source: "WAEC Bulletin 2023",
  },
  {
    state: "Kano State",
    zone: "NW",
    region: "North West Region",
    candidates: 112500,
    passRate: 46.5,
    malePass: 49.8,
    femalePass: 43.2,
    source: "WAEC Official 2023",
  },
  {
    state: "Borno State",
    zone: "NE",
    region: "North East Region",
    candidates: 31400,
    passRate: 38.9,
    malePass: 41.0,
    femalePass: 36.8,
    source: "NBS / WAEC 2023",
  },
];

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

const formatNumber = (number) =>
  new Intl.NumberFormat("en-NG").format(number);

const indicatorLabels = {
  cohort: "Sub-National Records",
  enrolment: "School Enrolment",
  completion: "Completion Rate",
  exam: "Examination Pass Rate",
  teachers: "Teacher-Pupil Ratio",
};

function SectionHeading({ children, dark = false }) {
  return (
    <h2
      className={`mb-6 flex items-center gap-2 text-xl font-bold sm:text-2xl ${
        dark ? "text-white" : "text-[#20272B]"
      }`}
    >
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#1F7A3F]" />
      {children}
    </h2>
  );
}

function Education() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState("WAEC");
  const [indicator, setIndicator] = useState("cohort");
  const [state, setState] = useState("all");
  const [year, setYear] = useState("2023");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // FIX: Declare the missing Export dropdown state.
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Results remain hidden until an authenticated user applies filters.
  const [appliedFilters, setAppliedFilters] = useState(null);

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

  // FIX: Return new users to Education after signup, not Health.
  const handleSignup = () => {
    navigate("/signup", {
      state: {
        from: {
          pathname: "/education",
        },
      },
    });
  };

  const selectedIndicatorLabel =
    indicatorLabels[appliedFilters?.indicator] ?? "Education Records";

  // The supplied cohort dataset contains demonstration records from 2023.
  // Other indicators require their own datasets before they can return results.
  const filteredRecords = useMemo(() => {
    if (!isLoggedIn || !appliedFilters) {
      return [];
    }

    if (
      appliedFilters.indicator !== "cohort" ||
      appliedFilters.year !== "2023"
    ) {
      return [];
    }

    return cohortRecords.filter((record) => {
      const matchesState =
        appliedFilters.state === "all" ||
        record.state === appliedFilters.state;

      const matchesSearch = record.state
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      return matchesState && matchesSearch;
    });
  }, [isLoggedIn, appliedFilters, search]);

  const handleApplyFilters = (event) => {
    event.preventDefault();

    if (!requireLogin("apply education indicators")) return;

    setAppliedFilters({
      indicator,
      state,
      year,
    });

    setSearch("");
    setShowExportOptions(false);
  };

  const handleExport = (format) => {
    if (!requireLogin("export education data")) return;

    // FIX: Explain why export cannot proceed if filters have not been applied.
    if (!appliedFilters) {
      alert("Please apply your filters before exporting data.");
      return;
    }

    if (
      appliedFilters.indicator !== "cohort" ||
      appliedFilters.year !== "2023"
    ) {
      alert(
        "There is no dataset available to export for this selection."
      );
      return;
    }

    // FIX: Prevent downloading an empty file when filters return no records.
    if (filteredRecords.length === 0) {
      alert("There are no matching records to export.");
      return;
    }

    const headers = [
      "State",
      "Geopolitical Zone",
      "Region",
      "Registered Candidates",
      "Pass Rate (%)",
      "Male Pass (%)",
      "Female Pass (%)",
      "Source",
    ];

    const rows = filteredRecords.map((record) => [
      record.state,
      record.zone,
      record.region,
      record.candidates,
      record.passRate,
      record.malePass,
      record.femalePass,
      record.source,
    ]);

    const fileName = `civic-intel-education-${appliedFilters.year}`;

    const downloadFile = (content, type, extension) => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${fileName}.${extension}`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    if (format === "csv") {
      const escapeCsv = (value) =>
        `"${String(value ?? "").replace(/"/g, '""')}"`;

      const csvContent = [headers, ...rows]
        .map((row) => row.map(escapeCsv).join(","))
        .join("\r\n");

      downloadFile(
        "\uFEFF" + csvContent,
        "text/csv;charset=utf-8;",
        "csv"
      );

      return;
    }

    if (format === "xml") {
      const escapeXml = (value) =>
        String(value ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

      const xmlRecords = filteredRecords
        .map(
          (record) => `
    <record>
      <state>${escapeXml(record.state)}</state>
      <zone>${escapeXml(record.zone)}</zone>
      <region>${escapeXml(record.region)}</region>
      <candidates>${record.candidates}</candidates>
      <passRate>${record.passRate}</passRate>
      <malePass>${record.malePass}</malePass>
      <femalePass>${record.femalePass}</femalePass>
      <source>${escapeXml(record.source)}</source>
    </record>`
        )
        .join("");

      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<educationData>
  <metadata>
    <indicator>${escapeXml(appliedFilters.indicator)}</indicator>
    <year>${escapeXml(appliedFilters.year)}</year>
    <selectedState>${escapeXml(appliedFilters.state)}</selectedState>
    <recordCount>${filteredRecords.length}</recordCount>
    <dataStatus>Demonstration data - unverified</dataStatus>
  </metadata>
  <records>${xmlRecords}
  </records>
</educationData>`;

      downloadFile(
        xmlContent,
        "application/xml;charset=utf-8;",
        "xml"
      );

      return;
    }

    if (format === "pdf") {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      doc.setFontSize(16);
      doc.text("CivicIntel - Education Data", 14, 16);

      doc.setFontSize(10);
      doc.text(`Indicator: ${selectedIndicatorLabel}`, 14, 24);

      doc.text(
        `Year: ${appliedFilters.year} | State: ${
          appliedFilters.state === "all"
            ? "All states"
            : appliedFilters.state
        }`,
        14,
        30
      );

      doc.setFontSize(9);
      doc.text(
        "Demonstration data only - not verified for policy decisions.",
        14,
        36
      );

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 42,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [11, 60, 93],
        },
        alternateRowStyles: {
          fillColor: [240, 245, 247],
        },
        margin: {
          left: 14,
          right: 14,
        },
      });

      doc.save(`${fileName}.pdf`);
    }
  };

  return (
    <main className="bg-[#E7EDF0] text-[#20272B]">
      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 md:min-h-92.5 md:grid-cols-2 md:py-12 lg:px-12 lg:py-12">
        <div className="order-2 md:order-1">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#1F7A3F]">
            Nigeria · Education data
          </p>

          <h1 className="max-w-xl text-3xl font-bold leading-tight text-[#0B3C5D] sm:text-4xl lg:text-5xl">
            Nigeria&apos;s{" "}
            <span className="text-[#1F7A3F]">Education</span> indicators, by
            state and over time
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-[#38464D]">
            Explore enrolment, completion, learning outcomes, teachers,
            examinations, infrastructure, and financing — with figures
            traceable to their sources.
          </p>
        </div>

        <div className="order-1 flex justify-center md:order-2 md:justify-end">
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
        </div>
      </section>

      {/* NATIONAL EDUCATION OVERVIEW */}
      <section className="bg-[#B5C7D1] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <SectionHeading>
            <span className="text-[#1F7A3F]">
              NATIONAL EDUCATION OVERVIEW
            </span>
          </SectionHeading>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {overviewStats.map((stat, index) => (
              <article
                key={`${stat.label}-${stat.description}`}
                tabIndex={0}
                className="
                  group relative min-h-28 cursor-pointer overflow-hidden
                  rounded-md border border-transparent border-l-4
                  bg-[#F0F1F0] p-3.5 shadow-sm
                  transform-gpu transition-all duration-300 ease-out
                  hover:-translate-y-1 hover:scale-[1.02]
                  hover:border-[#1F7A3F] hover:shadow-xl
                  active:scale-[0.98]
                  focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-[#1F7A3F]
                  motion-reduce:transform-none motion-reduce:transition-none
                "
                style={{
                  borderLeftColor: stat.color,
                  transitionDelay: `${index * 40}ms`,
                }}
              >
                <span
                  className="inline-block rounded-full px-3 py-1 text-[9px] font-medium text-white transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: stat.color }}
                >
                  {stat.label}
                </span>

                <p className="mt-2 text-lg font-bold text-[#20272B] transition-transform duration-300 ease-out group-hover:translate-x-0.5">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs leading-5">
                  {stat.description}
                </p>

                <div className="my-2 border-t border-dashed border-gray-400" />

                <p className="text-[10px] text-gray-600">{stat.source}</p>
              </article>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-700">
            Figures shown are demonstration content and should be verified
            against their original sources before publication.
          </p>
        </div>
      </section>

      {/* PUBLIC EXAM SUMMARIES */}
      <section className="px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <SectionHeading>EXAMINATION PERFORMANCE OVERVIEW</SectionHeading>

          <div className="grid gap-5 lg:grid-cols-[2.2fr_0.8fr]">
            <div className="rounded-lg bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap gap-5 border-b border-gray-200">
                {Object.keys(examSummaries).map((examName) => (
                  <button
                    key={examName}
                    type="button"
                    onClick={() => setExam(examName)}
                    aria-pressed={exam === examName}
                    className={`pb-3 text-xs transition ${
                      exam === examName
                        ? "border-b-2 border-[#1F7A3F] font-semibold text-[#1F7A3F]"
                        : "text-gray-500 hover:text-[#0B3C5D]"
                    }`}
                  >
                    {examName} Summary
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-5">
                {examSummaries[exam].map((item) => (
                  <div
                    key={item.state}
                    className="grid grid-cols-[90px_1fr_42px] items-center gap-3"
                  >
                    <span className="text-[10px] font-semibold">
                      {item.state}
                    </span>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-[#1F7A3F] transition-all duration-500"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>

                    <span className="text-right text-[10px] font-semibold text-[#1F7A3F]">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-[10px] text-gray-500">
                {exam} · Demonstration summary · Not verified examination
                statistics
              </p>
            </div>

            <aside className="rounded-lg bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-[#0B3C5D]">
                Trend Metadata &amp; Audit
              </p>

              <div className="mt-4 space-y-4 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">Reporting standard</span>
                  <span className="text-right font-semibold">
                    UBE National Blueprint
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">Audited classrooms</span>
                  <span className="text-right font-semibold">
                    3,241 (Kaduna)
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-500">Teacher census match</span>
                  <span className="text-right font-semibold text-[#1F7A3F]">
                    94.1% consistent
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-200 pt-4 text-[10px] leading-5 text-gray-500">
                Source: Federal Ministry of Education
                <br />
                Vintage: 2023–2024
                <br />
                Last verified: Demo record
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* EDUCATION INDICATOR FILTERS */}
      <section className="px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <SectionHeading>EDUCATION INDICATOR</SectionHeading>

          <form onSubmit={handleApplyFilters}>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-2 text-xs">
                Indicator

                <select
                  value={indicator}
                  onChange={(event) => setIndicator(event.target.value)}
                  className="w-full rounded-xl border border-[#B7C5CB] bg-[#B5C7D1] px-3 py-3 text-sm outline-none focus:border-[#1F7A3F]"
                >
                  <option value="cohort">Sub-National Records</option>
                  <option value="enrolment">School Enrolment</option>
                  <option value="completion">Completion Rate</option>
                  <option value="exam">Examination Pass Rate</option>
                  <option value="teachers">Teacher-Pupil Ratio</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-xs">
                State

                <select
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  className="w-full rounded-xl border border-[#B7C5CB] bg-[#B5C7D1] px-3 py-3 text-sm outline-none focus:border-[#1F7A3F]"
                >
                  <option value="all">All states</option>

                  {cohortRecords.map((record) => (
                    <option key={record.state} value={record.state}>
                      {record.state}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-xs">
                Year

                <select
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className="w-full rounded-xl border border-[#B7C5CB] bg-[#B5C7D1] px-3 py-3 text-sm outline-none focus:border-[#1F7A3F]"
                >
                  <option value="2023">2023</option>
                  <option value="2023-2024">2023–2024</option>
                  <option value="2025">2025</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
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
      </section>

      {/* PROTECTED SUB-NATIONAL COHORT DASHBOARD */}
      <section className="rounded-md bg-[#061D2A] px-4 py-8 text-white sm:px-6 lg:px-12">
        <div className="mx-auto max-w-5xl">
          {!isLoggedIn ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-8 text-center sm:p-10">
              <h2 className="mt-4 text-xl font-bold sm:text-2xl">
                Unlock Education Data Analysis
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/70">
                Log in to apply education indicators, view state-level cohort
                records, search the dataset, and export your results.
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
              <h2 className="text-xl font-bold">Your Education Analysis</h2>

              <p className="mt-3 text-sm leading-6 text-white/70">
                Choose an indicator, state, and year above, then click Apply
                to view your filtered education records.
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
                    Selected state:{" "}
                    {appliedFilters.state === "all"
                      ? "All states"
                      : appliedFilters.state}
                    {" · "}
                    Selected year: {appliedFilters.year}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFilters((previous) => !previous)}
                    aria-expanded={showFilters}
                    className="rounded-full bg-white px-6 py-2 text-xs font-semibold text-[#1F7A3F] transition hover:bg-gray-100 active:scale-[0.98]"
                  >
                    {showFilters ? "Hide search" : "Search records"} ☰
                  </button>

                  {/* FIX: Export dropdown now uses declared state. */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        if (!requireLogin("export education data")) return;

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
                          { label: "Export as XML", format: "xml" },
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
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Type a state name..."
                      className="mt-2 w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-sm text-[#20272B] outline-none focus:border-[#1F7A3F] sm:max-w-sm"
                    />
                  </label>
                </div>
              )}

              {appliedFilters.indicator !== "cohort" ||
              appliedFilters.year !== "2023" ? (
                <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-5">
                  <h3 className="font-semibold text-amber-200">
                    Dataset not available for this selection
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/75">
                    The current demonstration dataset only supports
                    Sub-National Records for 2023. Choose that indicator and
                    year to view the available sample records. Other
                    indicators and years need their own datasets before they
                    can display accurate results.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-sm bg-gray-200 px-2 py-1 text-[10px] text-gray-700">
                      Showing {filteredRecords.length} of{" "}
                      {cohortRecords.length} demo records
                    </span>

                    <span className="text-[10px] text-amber-300">
                      Illustrative data only — not for policy decisions.
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-sm">
                    <table className="w-full min-w-212.5 border-collapse bg-[#FFFBEF] text-left text-[#20272B]">
                      <thead className="bg-[#E5EBEE] text-[10px] uppercase">
                        <tr>
                          <th className="px-4 py-4">State / entity</th>
                          <th className="px-4 py-4 text-right">
                            Registered candidates
                          </th>
                          <th className="px-4 py-4 text-right">
                            Pass rate (5+ credits)
                          </th>
                          <th className="px-4 py-4 text-right">
                            Male pass %
                          </th>
                          <th className="px-4 py-4 text-right">
                            Female pass %
                          </th>
                          <th className="px-4 py-4">
                            Source / integrity status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredRecords.map((record) => (
                          <tr
                            key={record.state}
                            className="border-b border-[#B7C7CF] text-xs transition-colors hover:bg-[#F4F0E3]"
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className="rounded-sm bg-[#416B84] px-1.5 py-1 text-[9px] font-bold text-white">
                                  {record.zone}
                                </span>

                                <div>
                                  <p className="font-semibold">
                                    {record.state}
                                  </p>

                                  <p className="mt-1 text-[9px] text-gray-500">
                                    {record.region}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-right tabular-nums">
                              {formatNumber(record.candidates)}
                            </td>

                            <td className="px-4 py-4 text-right">
                              <span className="font-semibold">
                                {record.passRate}%
                              </span>
                            </td>

                            <td className="px-4 py-4 text-right">
                              {record.malePass}%
                            </td>

                            <td className="px-4 py-4 text-right text-[#1F7A3F]">
                              {record.femalePass}%
                            </td>

                            <td className="px-4 py-4">
                              <span className="font-semibold text-[#1F7A3F]">
                                ● {record.source}
                              </span>

                              <p className="mt-1 text-[9px] text-gray-500">
                                Demo — unverified
                              </p>
                            </td>
                          </tr>
                        ))}

                        {filteredRecords.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-8 text-center text-sm text-gray-500"
                            >
                              No matching records. Try another state or search
                              term.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-5 bg-[#E5EBEE] p-4 text-[#0B3C5D]">
                    <p className="text-xs font-bold">
                      Dataset Provenance &amp; Rigour Declaration
                    </p>

                    <p className="mt-2 text-[10px] leading-5">
                      Source: education examination and administrative data
                      <br />
                      Vintage: demonstration dataset
                      <br />
                      Verification: pending connection to official, validated
                      sources
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* LATEST EDUCATION RELEASES */}
      <section className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionHeading>LATEST EDUCATION RELEASE</SectionHeading>

            <a
              href="#education-releases"
              className="mb-6 text-xs font-semibold text-[#1F7A3F] hover:underline"
            >
              View all Releases →
            </a>
          </div>

          <div
            id="education-releases"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {releases.map((release) => (
              <article
                key={release.title}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <img
                  src={release.image}
                  alt=""
                  loading="lazy"
                  className="h-48 w-full object-cover"
                />

                <div className="p-4">
                  <p className="text-[10px] text-gray-500">
                    {release.category}
                  </p>

                  <h3 className="mt-3 text-sm font-semibold leading-6">
                    {release.title}
                  </h3>

                  <p className="mt-3 text-xs text-[#1F7A3F]">
                    Demonstration release
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Education;
