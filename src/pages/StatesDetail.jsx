
import { Link, useParams } from "react-router-dom";

const stateProfiles = {
  fct: {
    name: "Federal Capital Territory",
    shortName: "FCT",
    capital: "Abuja",
    zone: "North Central",
    health: 66.5,
    education: 74.1,
    population: "Demo value pending data integration",
    description:
      "Explore health services, education outcomes, infrastructure, and public spending across the Federal Capital Territory.",
  },
  lagos: {
    name: "Lagos State",
    shortName: "Lagos",
    capital: "Ikeja",
    zone: "South West",
    health: 71.2,
    education: 81.4,
    population: "Demo value pending data integration",
    description:
      "Explore Lagos State's health coverage, school outcomes, public services, and budget indicators.",
  },
  kano: {
    name: "Kano State",
    shortName: "Kano",
    capital: "Kano",
    zone: "North West",
    health: 44.8,
    education: 38.9,
    population: "Demo value pending data integration",
    description:
      "Explore Kano State's health services, education outcomes, and sub-national development indicators.",
  },
  rivers: {
    name: "Rivers State",
    shortName: "Rivers",
    capital: "Port Harcourt",
    zone: "South South",
    health: 58.7,
    education: 52.3,
    population: "Demo value pending data integration",
    description:
      "Explore Rivers State's health and education indicators, public services, and government spending.",
  },
  ogun: {
    name: "Ogun State",
    shortName: "Ogun",
    capital: "Abeokuta",
    zone: "South West",
    health: 63.5,
    education: 65.4,
    population: "Demo value pending data integration",
    description:
      "Explore Ogun State's health, education, and public service indicators.",
  },
  kaduna: {
    name: "Kaduna State",
    shortName: "Kaduna",
    capital: "Kaduna",
    zone: "North West",
    health: 49.2,
    education: 41.7,
    population: "Demo value pending data integration",
    description:
      "Explore Kaduna State's health coverage, education outcomes, and development indicators.",
  },
  enugu: {
    name: "Enugu State",
    shortName: "Enugu",
    capital: "Enugu",
    zone: "South East",
    health: 60.9,
    education: 63.2,
    population: "Demo value pending data integration",
    description:
      "Explore Enugu State's health services, school outcomes, and public spending.",
  },
  "cross-river": {
    name: "Cross River State",
    shortName: "Cross River",
    capital: "Calabar",
    zone: "South South",
    health: 55.4,
    education: 57.8,
    population: "Demo value pending data integration",
    description:
      "Explore Cross River State's health and education indicators and public services.",
  },
  abia: {
    name: "Abia State",
    shortName: "Abia",
    capital: "Umuahia",
    zone: "South East",
    health: 54.3,
    education: 57.4,
    population: "Demo value pending data integration",
    description:
      "Explore Abia State's health coverage, learning outcomes, and public sector indicators.",
  },
};

function MetricCard({ label, value, description }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-[#0B3C5D]">{value}</p>
      <p className="mt-2 text-sm leading-5 text-gray-600">{description}</p>
    </article>
  );
}

function StateDetails() {
  const { stateSlug } = useParams();
  const state = stateProfiles[stateSlug];

  if (!state) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#E7EDF0] px-5 text-center">
        <h1 className="text-3xl font-bold text-[#0B3C5D]">
          State profile not found
        </h1>
        <p className="mt-3 text-gray-600">
          This state profile is not available in the current demonstration.
        </p>
        <Link
          to="/states"
          className="mt-6 rounded-full bg-[#1F7A3F] px-6 py-3 font-semibold text-white"
        >
          Back to states
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#E7EDF0] text-[#20272B]">
      {/* Profile header */}
      <section className="bg-[#0B3C5D] px-5 py-10 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/states"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            <span aria-hidden="true">←</span> Back to states directory
          </Link>

          <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-[#8FE0A6]">
            CivicIntel · State profile
          </p>

          <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-bold sm:text-5xl">
                {state.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                {state.description}
              </p>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/10 p-4 md:min-w-48">
              <p className="text-xs text-white/65">State capital</p>
              <p className="mt-1 text-lg font-semibold">{state.capital}</p>
              <p className="mt-3 text-xs text-white/65">Geopolitical zone</p>
              <p className="mt-1 font-medium">{state.zone}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0B3C5D]">
            State overview
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            A snapshot of key indicators. Figures shown here are placeholders,
            not verified state statistics.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Health"
            value={`${state.health}%`}
            description="Illustrative ANC 4+ coverage"
          />
          <MetricCard
            label="Education"
            value={`${state.education}%`}
            description="Illustrative completion rate"
          />
          <MetricCard
            label="Population"
            value="Pending"
            description={state.population}
          />
          <MetricCard
            label="Data coverage"
            value="In progress"
            description="Source validation and dataset integration pending"
          />
        </div>

        {/* Health and education details */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-[#0B3C5D]">
                Health indicators
              </h2>
              <span className="rounded-full bg-[#E3F2E8] px-3 py-1 text-xs text-[#1F7A3F]">
                Preview
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              This section will contain maternal health, immunisation,
              healthcare access, facility availability, and other health
              measures for {state.shortName}.
            </p>

            <div className="mt-6 rounded-xl bg-[#E7EDF0] p-5">
              <p className="text-sm font-semibold">Health data visualisation</p>
              <div className="mt-4 flex h-36 items-center justify-center rounded-lg border border-dashed border-[#8CA3AF] bg-white px-4 text-center text-sm text-gray-500">
                Chart placeholder — connect the health dataset here
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-[#0B3C5D]">
                Education indicators
              </h2>
              <span className="rounded-full bg-[#E3F2E8] px-3 py-1 text-xs text-[#1F7A3F]">
                Preview
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              This section will contain enrolment, completion, examination
              outcomes, teacher-pupil ratios, and school infrastructure
              indicators for {state.shortName}.
            </p>

            <div className="mt-6 rounded-xl bg-[#E7EDF0] p-5">
              <p className="text-sm font-semibold">Education data visualisation</p>
              <div className="mt-4 flex h-36 items-center justify-center rounded-lg border border-dashed border-[#8CA3AF] bg-white px-4 text-center text-sm text-gray-500">
                Chart placeholder — connect the education dataset here
              </div>
            </div>
          </section>
        </div>

        {/* Further details */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-[#0B3C5D]">
            Sources, methodology &amp; revisions
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
            Each published indicator will include its original source,
            reporting period, methodology, last updated date, and any revisions
            so visitors can understand and verify the data.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ["Data sources", "Pending verified source integration"],
              ["Reporting period", "To be assigned per dataset"],
              ["Last verified", "Pending validation"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-gray-200 p-4"
              >
                <p className="text-xs text-gray-500">{label}</p>
                <p className="mt-2 text-sm font-semibold text-[#0B3C5D]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8">
          <Link
            to="/states"
            className="inline-flex items-center gap-2 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176331]"
          >
            ← Return to all states
          </Link>
        </div>
      </section>
    </main>
  );
}

export default StateDetails;
