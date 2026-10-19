
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const states = [
  {
    name: "FCT",
    slug: "fct",
    capital: "Abuja",
    zone: "North Central",
    health: 66.5,
    education: 74.1,
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Lagos State",
    slug: "lagos",
    capital: "Ikeja",
    zone: "South West",
    health: 71.2,
    education: 81.4,
    image:
      "https://images.unsplash.com/photo-1569988046894-2b8c6c7f4c3b?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Kano State",
    slug: "kano",
    capital: "Kano",
    zone: "North West",
    health: 44.8,
    education: 38.9,
    image:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Rivers State",
    slug: "rivers",
    capital: "Port Harcourt",
    zone: "South South",
    health: 58.7,
    education: 52.3,
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Ogun State",
    slug: "ogun",
    capital: "Abeokuta",
    zone: "South West",
    health: 63.5,
    education: 65.4,
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Kaduna State",
    slug: "kaduna",
    capital: "Kaduna",
    zone: "North West",
    health: 49.2,
    education: 41.7,
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Enugu State",
    slug: "enugu",
    capital: "Enugu",
    zone: "South East",
    health: 60.9,
    education: 63.2,
    image:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Cross River State",
    slug: "cross-river",
    capital: "Calabar",
    zone: "South South",
    health: 55.4,
    education: 57.8,
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Abia State",
    slug: "abia",
    capital: "Umuahia",
    zone: "South East",
    health: 54.3,
    education: 57.4,
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=700&q=80",
  },
];

function States() {
  const [indicator, setIndicator] = useState("health");
  const [year, setYear] = useState("2026");
  const [search, setSearch] = useState("");

  const filteredStates = useMemo(() => {
    return states.filter((state) =>
      state.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <main className="min-h-screen bg-[#E7EDF0] text-[#0B3C5D]">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 md:pb-24 lg:px-12">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase text-[#1F7A3F]">
              Territorial compass
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              States &amp; F.C.T
              <br />
              Directory
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#394951]">
              Browse Nigeria's 36 states and the FCT. Each profile includes
              health, education, and budget indicators with source attribution.
            </p>
          </div>

          <div className="h-56 overflow-hidden rounded-2xl rounded-bl-[70px] bg-[#0B3C5D] sm:h-72">
            <img
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=85"
              alt="Organised public records and documents"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="relative z-10 mx-auto -mt-5 grid max-w-4xl gap-5 rounded-2xl bg-[#0B3C5D] p-5 text-white shadow-lg sm:grid-cols-2 sm:p-6">
          <label className="flex flex-col gap-3 text-sm font-semibold">
            Indicator
            <select
              value={indicator}
              onChange={(event) => setIndicator(event.target.value)}
              className="rounded-xl bg-white px-4 py-3 font-normal text-[#0B3C5D] outline-none"
            >
              <option value="health">ANC 4+ Coverage</option>
              <option value="education">Education Completion Rate</option>
            </select>
          </label>

          <label className="flex flex-col gap-3 text-sm font-semibold">
            Year
            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="rounded-xl bg-white px-4 py-3 font-normal text-[#0B3C5D] outline-none"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </label>
        </div>

        <p className="mt-5 text-center text-xs text-gray-500">
          Demonstration indicators for layout development · Selected year: {year}
        </p>

        {/* Search */}
        <div className="mb-8 mt-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Explore states</h2>
            <p className="mt-1 text-sm text-gray-600">
              Select a state to view its full profile and indicators.
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search states..."
            aria-label="Search states"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#1F7A3F] sm:max-w-xs"
          />
        </div>

        {/* State cards */}
        <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStates.map((state) => {
            const value =
              indicator === "health" ? state.health : state.education;
            const label =
              indicator === "health"
                ? "ANC 4+ coverage"
                : "Completion rate";

            return (
              <Link
                key={state.slug}
                to={`/states/${state.slug}`}
                className="group block min-w-0 text-white transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="relative mx-2 mb-0 h-44 rounded-t-xl bg-[#416B84] sm:h-48">
                  <img
                    src={state.image}
                    alt={`${state.name} — illustrative photograph`}
                    loading="lazy"
                    className="absolute -bottom-5 left-2 h-48 w-[calc(100%-8px)] rounded-xl object-cover shadow-sm transition-transform group-hover:scale-[1.02] sm:h-52"
                  />
                </div>

                <div className="relative mx-1 mt-8 bg-[#061D2A] px-4 pb-4 pt-3">
                  <h3 className="font-semibold">{state.name}</h3>
                  <p className="mt-1 text-[11px] text-white/60">
                    Capital: {state.capital}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-medium">{value}%</p>
                      <p className="mt-1 text-[9px] uppercase text-white/60">
                        {label}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {indicator === "health"
                          ? state.education
                          : state.health}
                        %
                      </p>
                      <p className="mt-1 text-[9px] uppercase text-white/60">
                        {indicator === "health"
                          ? "Completion rate"
                          : "ANC 4+ coverage"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-white/80">
                      • Demo data · {year}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-lg transition-transform group-hover:translate-x-1"
                    >
                      ↗
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredStates.length === 0 && (
          <p className="py-12 text-center text-gray-600">
            No matching states found. Try another search.
          </p>
        )}

        <p className="mt-10 text-center text-xs text-gray-500">
          This initial version displays 9 sample profiles. We can expand the
          directory to all 36 states and the FCT.
        </p>
      </section>
    </main>
  );
}

export default States;
