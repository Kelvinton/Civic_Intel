
import { useState } from "react";
import civicIntel from "../assets/civicintel.hero.logo.png"; 
import civicIntelLogo from "../assets/civicintellogo1.png";

const overviewStats = [
  {
    label: "COVERAGE",
    value: "67.4%",
    description: "ANC 4+ Coverage",
    source: "NDHS • 2023",
    color: "#1F7A3F",
  },
  {
    label: "OUTCOMES",
    value: "512",
    description: "Maternal mortality /100k",
    source: "NDHS • 2023",
    color: "#8B2922",
  },
  {
    label: "COVERAGE",
    value: "57%",
    description: "Full immunization 12–23mon",
    source: "NDHS • 2023",
    color: "#145C3B",
  },
  {
    label: "SYSTEM",
    value: "1:4",
    description: "Doctor-to-population",
    source: "FMCH • 2022",
    color: "#0B3C5D",
  },
  {
    label: "FINANCING",
    value: "67.4%",
    description: "Health share of state budget",
    source: "BudgetIT • 2025",
    color: "#D6A400",
  },
];

// DEMO ONLY: Replace with verified health data when your API is ready.
const demoStateData = [
  { state: "Imo", value: 86.8, zone: "SE" },
  { state: "Lagos", value: 82.5, zone: "SW" },
  { state: "Ogun", value: 76.1, zone: "SW" },
  { state: "Oyo", value: 71.4, zone: "SW" },
  { state: "Rivers", value: 68.2, zone: "SS" },
  { state: "Kaduna", value: 53.0, zone: "NW" },
  { state: "Kano", value: 48.2, zone: "NW" },
  { state: "Borno", value: 39.5, zone: "NE" },
  { state: "Sokoto", value: 28.3, zone: "NW" },
];

const releases = [
  {
    category: "Health • Kano state",
    title: "Immunisation coverage trends 2019 to 2024",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Health • National",
    title: "Maternal mortality: state-by-state, 2023",
    image:
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Health • Rivers state",
    title: "Health budget execution, FY2025",
    image:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
  },
];

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

function Health() {
  const [indicator, setIndicator] = useState("anc");
  const [state, setState] = useState("all");
  const [year, setYear] = useState("2020-2024");
  const [appliedFilters, setAppliedFilters] = useState({
    indicator: "anc",
    state: "all",
    year: "2020-2024",
  });

  const handleApplyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters({ indicator, state, year });
  };

  const indicatorLabel =
    appliedFilters.indicator === "anc"
      ? "ANC 4+ Attendance"
      : appliedFilters.indicator === "immunization"
        ? "Full Immunization Coverage"
        : "Maternal Mortality";

  return (
    <main className="bg-[#E8EEF1] text-[#20272B]">
      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-8 sm:px-8 md:min-h-148.75 md:grid-cols-2 md:py-16 lg:px-8 ">
        <div className="order-2 md:order-1">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#1F7A3F]">
            Nigeria · Health data
          </p>

          <h1 className="max-w-xl text-3xl font-bold leading-tight text-[#0B3C5D] sm:text-4xl lg:text-5xl">
            Nigeria&apos;s <span className="text-[#1F7A3F]">Health</span>{" "}
            indicators, by state and over time
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-[#38464D]">
            Explore coverage, outcomes, and system indicators drawn from
            national surveys and administrative sources, filterable by state
            and year.
          </p>
        </div>

        <div className="order-1 flex justify-center md:order-2 md:justify-end">
          {/* Image wrapper */}
          <div className="relative h-64 w-full max-w-md rounded-bl-[80px] rounded-tr-[80px] bg-[#0B3C5D] sm:h-80 md:h-82.5 lg:h-148.75">

            {/* Main image */}
            <img
              src={civicIntel}
              alt="Digital technology and data visualisation"
              className="h-full w-full rounded-bl-[80px] rounded-tr-[80px] object-cover opacity-80"
            />

            {/* Logo outside normal flow, anchored to image */}
            <img
              src={civicIntelLogo}
              alt="CivicIntel logo"
              className="absolute -bottom-10 -right-4 z-10 w-24 h-auto object-contain sm:w-28 md:w-32"
            />

          </div>
        </div>
      </section>

      {/* NATIONAL OVERVIEW */}
      <section className="bg-[#0B3C5D] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <SectionHeading dark>NATIONAL HEALTH OVERVIEW</SectionHeading>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {overviewStats.map((stat) => (
              <article
                key={stat.description}
                className="min-h-32 rounded-md border-l-4 bg-[#F0F1F0] p-4 shadow-sm"
                style={{ borderLeftColor: stat.color }}
              >
                <span
                  className="inline-block rounded-full px-3 py-1 text-[9px] font-medium text-white"
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

                <p className="text-[10px] text-gray-600">{stat.source}</p>
              </article>
            ))}
          </div>

          <p className="mt-4 text-xs text-white/60">
            Demonstration values only. Figures and source dates must be
            verified before publication.
          </p>
        </div>
      </section>

      {/* INDICATOR FILTERS */}
      <section className="bg-[#EAF2EC] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <SectionHeading>HEALTH INDICATOR</SectionHeading>

          <form onSubmit={handleApplyFilters}>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-2 text-xs">
                Indicator
                <select
                  value={indicator}
                  onChange={(event) => setIndicator(event.target.value)}
                  className="w-full rounded-xl border border-[#B7C5CB] bg-[#C5D2D9] px-3 py-3 text-sm outline-none focus:border-[#1F7A3F]"
                >
                  <option value="anc">Antenatal Care (ANC 4+ Visits)</option>
                  <option value="immunization">Full Immunization Coverage</option>
                  <option value="maternal">Maternal Mortality</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-xs">
                State
                <select
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  className="w-full rounded-xl border border-[#B7C5CB] bg-[#C5D2D9] px-3 py-3 text-sm outline-none focus:border-[#1F7A3F]"
                >
                  <option value="all">All Geo-political zones</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Kano">Kano</option>
                  <option value="Rivers">Rivers</option>
                  <option value="Oyo">Oyo</option>
                  <option value="Imo">Imo</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-xs">
                Year
                <select
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className="w-full rounded-xl border border-[#B7C5CB] bg-[#C5D2D9] px-3 py-3 text-sm outline-none focus:border-[#1F7A3F]"
                >
                  <option value="2020-2024">2020–2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="mx-auto mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176331] md:w-1/2"
            >
              Apply filters <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>
      </section>

      {/* CHART + ANALYSIS */}
      <section className="bg-[#082C40] px-5 py-8 text-white sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-5xl gap-7 lg:grid-cols-[1.8fr_0.8fr]">
          <div className="rounded-sm bg-white p-4 text-[#20272B] sm:p-6">
            <div className="mb-5">
              <p className="text-base font-bold text-[#0B3C5D]">
                {indicatorLabel} by Selected States
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Percentage (%) of live births in the 5-year survey window
              </p>
              <p className="mt-2 text-[10px] text-amber-700">
                Demo chart — not verified health statistics
              </p>
            </div>

            <div className="space-y-4">
              {demoStateData
                .filter(
                  (item) => appliedFilters.state === "all" || item.state === appliedFilters.state
                )
                .map((item) => (
                  <div
                    key={item.state}
                    className="grid grid-cols-[48px_1fr_40px] items-center gap-2"
                  >
                    <span className="text-xs font-medium">{item.state}</span>
                    <div className="h-5 overflow-hidden rounded-sm bg-[#E5EAED]">
                      <div
                        className="flex h-full items-center justify-end rounded-sm bg-[#164C32] pr-2 text-[10px] font-semibold text-white"
                        style={{ width: `${item.value}%` }}
                      >
                        {item.value}%
                      </div>
                    </div>
                    <span className="text-right text-[10px] text-gray-500">
                      {item.zone}
                    </span>
                  </div>
                ))}
            </div>

            <div className="mt-6 flex justify-between border-t border-gray-200 pt-3 text-[10px] text-gray-500">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>

            <div className="mt-8 rounded-md bg-[#E8EEF1] p-4">
              <p className="text-xs font-bold text-[#145C3B]">
                ✓ DATA PROVENANCE RECORD
              </p>
              <p className="mt-2 text-xs leading-5 text-gray-600">
                Primary source, data vintage, audit date, licence, and
                methodology will be displayed here when verified datasets are
                connected.
              </p>
            </div>
          </div>

          <aside className="space-y-6">
            <div>
              <span className="bg-white px-2 py-1 text-[10px] text-[#0B3C5D]">
                Analysis brief
              </span>
              <p className="mt-3 text-lg font-bold">
                Health indicators across Nigeria
              </p>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Compare health outcomes by state, explore changes over time,
                and review the sources behind each indicator.
              </p>
              <p className="mt-3 text-xs leading-5 text-white/50">
                Selected filters: {appliedFilters.state === "all" ? "All states" : appliedFilters.state}
                {" · "}{appliedFilters.year}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.alert("Export will be enabled when the dataset is connected.")
                }
                className="mt-3 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#1F7A3F] px-5 py-3 text-sm font-semibold hover:bg-[#176331]"
              >
                Export data

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() =>
                  window.alert("Save will be enabled when user accounts are implemented.")
                }
                className="mt-3 w-full rounded-full bg-[#1F7A3F] px-5 py-3 text-sm font-semibold hover:bg-[#176331]"
              >
                Save indicator ♧
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold">Facility Spot Check</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">
                A future map will show verified health facilities and their
                locations.
              </p>
              <div className="mt-4 flex min-h-44 items-center justify-center rounded-lg border border-white/20 bg-white/10 p-6 text-center">
                <div>
                  <p className="text-3xl" aria-hidden="true">⌖</p>
                  <p className="mt-2 text-sm font-semibold">Facility map</p>
                  <p className="mt-1 text-xs text-white/60">
                    Map integration coming with verified facility data
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* LATEST RELEASES */}
      <section className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionHeading>LATEST HEALTH RELEASE</SectionHeading>
            <a
              href="#health-releases"
              className="mb-6 text-xs font-semibold text-[#1F7A3F] hover:underline"
            >
              View all releases →
            </a>
          </div>

          <div id="health-releases" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {releases.map((release) => (
              <article
                key={release.title}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <img
                  src={release.image}
                  alt=""
                  loading="lazy"
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-[10px] text-gray-500">{release.category}</p>
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

export default Health;
