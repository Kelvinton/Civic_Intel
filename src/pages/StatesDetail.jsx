
import { Link, useParams } from "react-router-dom";
import StateHero from "../assets/states/States.hero.png";

const stateProfiles = {
  lagos: {
    name: "Lagos State",
    capital: "Ikeja",
    population: "~15.9M (est.)",
    image: StateHero,
    health: [
      { value: "71.2%", label: "ANC 4+ Coverage (national)", trend: "▲ 3.8 pts vs national", source: "NDHS • 2023", positive: true },
      { value: "438", label: "Maternal mortality /100k", trend: "▼ below national average", source: "NDHS • 2023", positive: false },
      { value: "64%", label: "Full immunization", trend: "▲ 7 pts vs national", source: "NDHS • 2023", positive: true },
      { value: "1:2", label: "Doctor-to-population", trend: "▲ above national average", source: "FMCH • 2022", positive: true },
      { value: "6.8%", label: "Health budget share", trend: "▲ 2.1 pts vs prior year", source: "BudgIT • 2025", positive: true },
    ],
    education: [
      { value: "81.4%", label: "Primary completion rate", trend: "▲ 13 pts vs national", source: "NBS/UBEC • 2023", positive: true },
      { value: "89%", label: "Net primary enrollment", trend: "▲ 21 pts vs national", source: "NBS/UBEC • 2023", positive: true },
      { value: "72.1%", label: "WAEC pass rate", trend: "▲ above national average", source: "WAEC • 2025", positive: true },
      { value: "1:32", label: "Teacher-pupil ratio", trend: "▲ better than national", source: "FME • 2022", positive: true },
      { value: "9.4%", label: "Education budget share", trend: "≈ national average", source: "BudgIT • 2025", positive: true },
    ],
    publisher: "National Demographic and Health Survey (NDHS)",
    dataset: "NDHS 2023 State Report",
    vintage: "2023",
    geography: "State-level, Lagos",
    license: "Public / Open (per publisher terms)",
    verified: "September, 2026",
  },
  fct: {
    name: "Federal Capital Territory",
    capital: "Abuja",
    population: "Pending verification",
    image: StateHero,
  },
  kano: {
    name: "Kano State",
    capital: "Kano",
    population: "Pending verification",
    image:StateHero,
  },
  rivers: {
    name: "Rivers State",
    capital: "Port Harcourt",
    population: "Pending verification",
    image: StateHero,
  },
  ogun: {
    name: "Ogun State",
    capital: "Abeokuta",
    population: "Pending verification",
    image: StateHero,
  },
  kaduna: {
    name: "Kaduna State",
    capital: "Kaduna",
    population: "Pending verification",
    image: StateHero,
  },
  enugu: {
    name: "Enugu State",
    capital: "Enugu",
    population: "Pending verification",
    image: StateHero
  },
  "cross-river": {
    name: "Cross River State",
    capital: "Calabar",
    population: "Pending verification",
    image: StateHero,
  },
  abia: {
    name: "Abia State",
    capital: "Umuahia",
    population: "Pending verification",
    image: StateHero,
  },
};

const fallbackMetrics = [
  {
    value: "Pending",
    label: "Data integration",
    trend: "Awaiting verified dataset",
    source: "Not yet connected",
    positive: true,
  },
];

function IndicatorSection({ title, items = [] }) {
  const metrics = items.length ? items : Array(5).fill(fallbackMetrics[0]);

  return (
    <section className="mb-20">
      <h2 className="mb-7 flex items-center gap-2 text-2xl font-bold text-[#171D20] sm:text-3xl">
        <span className="h-3 w-3 rounded-full bg-[#1F7A3F]" />
        {title}
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
        {metrics.map((item, index) => (
          <article
            key={`${title}-${index}`}
            className="flex min-h-37.5 flex-col rounded-lg bg-white p-3 sm:min-h-41 sm:p-4"
          >
            <p className="text-lg font-bold text-[#161616]">
              {item.value}
            </p>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              {item.label}
            </p>

            <p
              className={`mt-2 text-[10px] leading-4 ${
                item.positive ? "text-[#1F7A3F]" : "text-red-600"
              }`}
            >
              {item.trend}
            </p>

            <div className="my-3 border-t border-dashed border-gray-200" />

            <p className="mt-auto text-[10px] text-gray-500">
              {item.source}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function StateDetails() {
  const { stateSlug } = useParams();
  const state = stateProfiles[stateSlug?.toLowerCase()];

  if (!state) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#E7EDF0] px-6 text-center">
        <h1 className="text-3xl font-bold text-[#0B3C5D]">
          State profile not found
        </h1>
        <p className="mt-3 text-gray-600">
          This state has not been added to the current directory data.
        </p>
        <Link
          to="/states"
          className="mt-6 rounded-full bg-[#1F7A3F] px-6 py-3 text-white"
        >
          Return to states
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-[#E7EDF0] text-[#0B3C5D]">
      {/* State hero */}
      <section className="mx-auto max-w-[1440px] px-5 pb-16 pt-8 sm:px-10 lg:px-14 lg:pb-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#1F7A3F]">
              Territorial compass
            </p>

            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
              {state.name}
            </h1>

            <p className="mt-3 text-sm text-[#40484D]">
              Capital: {state.capital}
              <span className="mx-2">|</span>
              Population: {state.population}
            </p>

            <a
              href="/states"
              className="mt-4 inline-flex items-center gap-3 rounded-full bg-[#1F7A3F] px-5 py-2.5 text-xs font-medium text-white transition hover:bg-[#176331]"
            >
              Compare this state
              <span
              className="flex size-5 items-center justify-center rounded-full bg-white text-[#1F7A3F]"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#0B3C5D" 
                stroke-width="1.8" 
                class="w-4 h-4"
                aria-hidden="true"
              >
                <path 
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.5 12h15m-7.5-7.5L19.5 12 12 19.5"
                />
              </svg>
            </span>
            </a>
          </div>

          <div className="h-64 overflow-hidden rounded-xl sm:h-72 lg:h-[295px]">
            <img
              src={state.image}
              alt={`Illustrative records image for ${state.name}`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Health and education indicators */}
      <div className="mx-auto max-w-[1440px] px-5 pb-6 sm:px-10 lg:px-14">
        <IndicatorSection title="HEALTH" items={state.health} />
        <IndicatorSection title="EDUCATION" items={state.education} />

        {/* Source and methodology */}
        <section className="mb-2 rounded-2xl bg-[#061D2A] px-6 py-8 text-white sm:px-8 sm:py-9 lg:px-10">
          <h2 className="text-xl font-bold">Source &amp; Methodology</h2>

          <div className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {[
              ["PUBLISHER", state.publisher || "Pending verified source"],
              ["DATASET", state.dataset || "Awaiting dataset integration"],
              ["VINTAGE", state.vintage || "Pending"],
              ["GEOGRAPHY", state.geography || `State-level, ${state.name}`],
              ["LICENSE", state.license || "To be confirmed from publisher"],
              ["LAST VERIFIED", state.verified || "Pending validation"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[11px] font-medium text-white/90">
                  {label}
                </p>
                <p className="mt-2 text-xs leading-5 text-white/60">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <Link
            to="/sources-and-methods"
            className="mt-8 inline-flex items-center gap-4 rounded-full bg-white px-4 py-3 text-xs font-medium text-[#1F7A3F] transition hover:bg-gray-100"
          >
            View revision history
            <span className="text-lg">→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}

export default StateDetails;
