
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StateHero from "../assets/states/States.hero.png";
import Adamawa from "../assets/states/Adamawa.jpg";
import AkwaIbom from "../assets/states/AkwaIbom.jpg";
import Anambra from "../assets/states/Anambra.jpg";
import Bauchi from "../assets/states/Bauchi.jpg";
import Bayelsa from "../assets/states/Bayelsa.jpg";
import Benue from "../assets/states/Benue.jpg";
import Borno from "../assets/states/Borno.jpg";
import Delta from "../assets/states/Delta.jpg";
import Ebonyi from "../assets/states/Ebonyi.jpg";
import Edo from "../assets/states/Edo.jpg";
import Ekiti from "../assets/states/Ekiti.jpg";
import Gombe from "../assets/states/Gombe.jpg";
import Imo from "../assets/states/Imo.jpg";
import Jigawa from "../assets/states/Jigawa.jpg";
import Katsina from "../assets/states/Katsina.jpg";
import Kebbi from "../assets/states/Kebbi.jpg";
import Kogi from "../assets/states/Kogi.jpg";
import Kwara from "../assets/states/Kwara.png";
import Nasarawa from "../assets/states/Nasarawa.jpg";
import Niger from "../assets/states/Niger.jpg";
import Ondo from "../assets/states/Ondo.jpg";
import Osun from "../assets/states/Osun.jpg";
import Oyo from "../assets/states/Oyo.jpg";
import Plateau from "../assets/states/Plateau.jpg";
import Sokoto from "../assets/states/Sokoto.jpg";
import Taraba from "../assets/states/Taraba.jpg";
import Yobe from "../assets/states/Yobe.jpg";
import Zamfara from "../assets/states/Zamfara.jpg";
import Abuja from "../assets/states/FCT.png";
import Abia from "../assets/states/Abia.jpg";
import Lagos from "../assets/states/Lagos.png";
import Kano from "../assets/states/Kano.jpg";
import Rivers from "../assets/states/Rivers.jpg";
import Ogun from "../assets/states/Ogun.jpg";
import Kaduna from "../assets/states/Kaduna.jpeg";
import Enugu from "../assets/states/Enugu.jfif";
import CrossRiver from "../assets/states/CrossRiver.png";

import { getStates } from "../api/referenceData.js";
import { getAllPublishedRecords } from "../api/publishedData.js";

function createSlug(name) {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

const stateImages = {
  abia: Abia,
  adamawa: Adamawa,
  "akwa-ibom": AkwaIbom,
  anambra: Anambra,
  bauchi: Bauchi,
  bayelsa: Bayelsa,
  benue: Benue,
  borno: Borno,
  "cross-river": CrossRiver,
  delta: Delta,
  ebonyi: Ebonyi,
  edo: Edo,
  ekiti: Ekiti,
  enugu: Enugu,
  fct: Abuja,
  gombe: Gombe,
  imo: Imo,
  jigawa: Jigawa,
  kaduna: Kaduna,
  kano: Kano,
  katsina: Katsina,
  kebbi: Kebbi,
  kogi: Kogi,
  kwara: Kwara,
  lagos: Lagos,
  nasarawa: Nasarawa,
  niger: Niger,
  ogun: Ogun,
  ondo: Ondo,
  osun: Osun,
  oyo: Oyo,
  plateau: Plateau,
  rivers: Rivers,
  sokoto: Sokoto,
  taraba: Taraba,
  yobe: Yobe,
  zamfara: Zamfara,
};

function normalizeStateName(name) {
  const normalized = name.toLowerCase().trim();

  if (
    normalized === "fct" ||
    normalized === "federal capital territory"
  ) {
    return "fct";
  }

  return normalized.replace(/\s+state$/i, "");
}


function formatValue(record) {
  if (!record || record.value == null) return "Not available";

  const value = Number(record.value);

  if (!Number.isFinite(value)) return "Not available";

  const formatted = new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 2,
  }).format(value);

  if (record.unit === "%") return `${formatted}%`;

  return `${formatted} ${record.unit || ""}`.trim();
}


function IndicatorSection({ title, records }) {
  const [showAll, setShowAll] = useState(false);

  // Keep only the latest published record for each indicator.
  const indicators = Object.values(
    records.reduce((grouped, record) => {
      const key = record.indicator_key;

      if (!key) return grouped;

      if (
        !grouped[key] ||
        Number(record.year) > Number(grouped[key].year)
      ) {
        grouped[key] = record;
      }

      return grouped;
    }, {})
  );

  const visibleIndicators = showAll
    ? indicators
    : indicators.slice(0, 5);

  return (
    <section className="mb-20">
      <h2 className="mb-7 flex items-center gap-2 pt-30 text-2xl font-bold text-[#171D20] sm:pt-28 sm:text-3xl">
        <span className="h-3 w-3 rounded-full bg-[#1F7A3F]" />
        {title}
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
        {visibleIndicators.map((record) => (
          <article
            key={record.indicator_key}
            className="flex min-h-37.5 flex-col rounded-lg bg-white p-3 sm:min-h-41 sm:p-4"
          >
            <p className="text-lg font-bold text-[#161616]">
              {formatValue(record)}
            </p>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              {record.indicator}
            </p>

            <div className="my-3 border-t border-dashed border-gray-200" />

            <p className="mt-auto text-[10px] text-gray-500">
              Published record • {record.year}
            </p>
          </article>
        ))}
      </div>

      {indicators.length > 5 && (
        <button
          type="button"
          onClick={() => setShowAll((previous) => !previous)}
          className="mt-6 text-sm font-semibold text-[#1F7A3F] hover:underline"
        >
          {showAll ? "See less" : "See more indicators"}
        </button>
      )}
    </section>
  );
}


function StateDetails() {
  const { stateSlug } = useParams();

  const [states, setStates] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [educationRecords, setEducationRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStateData() {
      try {
        setLoading(true);
        setError("");

        const [statesData, healthData, educationData] =
          await Promise.all([
            getStates(),
            getAllPublishedRecords({ sector: "health" }),
            getAllPublishedRecords({ sector: "education" }),
          ]);

        if (!isMounted) return;

        setStates(Array.isArray(statesData) ? statesData : []);
        
        setHealthRecords(healthData);
        setEducationRecords(educationData);
      } catch (err) {
        if (isMounted) {
          setError(
            err.message || "Unable to load this state's published data."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStateData();

    return () => {
      isMounted = false;
    };
  }, []);

  const state = useMemo(() => {
    return states.find(
      (item) => createSlug(item.name) === stateSlug?.toLowerCase()
    );
  }, [states, stateSlug]);
  const stateImageKey = state
  ? normalizeStateName(state.name).replace(/\s+/g, "-")
  : "";

  const stateImage = stateImages[stateImageKey] || StateHero;

  const selectedHealthRecords = useMemo(() => {
    if (!state) return [];

    return healthRecords.filter(
      (record) =>
        normalizeStateName(record.state) ===
        normalizeStateName(state.name)
    );
  }, [healthRecords, state]);

  const selectedEducationRecords = useMemo(() => {
    if (!state) return [];

    return educationRecords.filter(
      (record) =>
        normalizeStateName(record.state) ===
        normalizeStateName(state.name)
    );
  }, [educationRecords, state]);

  const allSelectedRecords = [
    ...selectedHealthRecords,
    ...selectedEducationRecords,
  ];

  const datasetIds = [
    ...new Set(
      allSelectedRecords
        .map((record) => record.dataset_id)
        .filter(Boolean)
    ),
  ];

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#E7EDF0] px-6 pt-24">
        <p className="text-sm text-[#0B3C5D]">
          Loading state profile...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#E7EDF0] px-6 pt-24 text-center">
        <h1 className="text-2xl font-bold text-[#0B3C5D]">
          Unable to load state profile
        </h1>
        <p className="mt-3 text-sm text-gray-600">{error}</p>
        <Link
          to="/states"
          className="mt-6 rounded-full bg-[#1F7A3F] px-6 py-3 text-white"
        >
          Return to states
        </Link>
      </main>
    );
  }

  if (!state) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#E7EDF0] px-6 pt-24 text-center">
        <h1 className="text-3xl font-bold text-[#0B3C5D]">
          State profile not found
        </h1>
        <p className="mt-3 text-gray-600">
          This location could not be found in the states directory.
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
      <section className="mx-auto max-w-7xl px-5 pb-12 pt-28 sm:px-10 sm:pt-32 lg:px-14 lg:pb-20 lg:pt-36">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#1F7A3F]">
              Territorial compass
            </p>

            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
              {state.name === "FCT"
                ? "Federal Capital Territory"
                : `${state.name} State`}
            </h1>

            <p className="mt-3 text-sm text-[#40484D]">
              Geopolitical Zone: {state.zone || "Not available"}
            </p>

            <Link
              to="/explore"
              state={{ compareState: state.name }}
              className="mt-4 inline-flex items-center gap-3 rounded-full bg-[#1F7A3F] px-5 py-2.5 text-xs font-medium text-white transition hover:bg-[#176331]"
            >
              Compare this state
              <span className="flex size-5 items-center justify-center rounded-full bg-white text-[#1F7A3F]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12h15m-7.5-7.5L19.5 12 12 19.5"
                  />
                </svg>
              </span>
            </Link>
          </div>

          <div className="h-64 overflow-hidden rounded-xl sm:h-72 lg:h-73.75">
            <img
              src={stateImage}
              alt={`Image representing ${state.name}`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <Link
        to="/states"
        className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-[#0B3C5D] transition hover:text-[#1F7A3F] mx-16"
      >
        <span aria-hidden="true">←</span>
        Back to States
      </Link>

      {/* Health and education indicators */}
      <div className="mx-auto max-w-7xl px-5 pb-6 sm:px-10 lg:px-14">
        <IndicatorSection
          title="HEALTH"
          records={selectedHealthRecords}
        />

        <IndicatorSection
          title="EDUCATION"
          records={selectedEducationRecords}
        />

        {/* Source and methodology */}
        <section className="mb-2 rounded-2xl bg-[#061D2A] px-6 py-8 text-white sm:px-8 sm:py-9 lg:px-10">
          <h2 className="text-xl font-bold">
            Source &amp; Methodology
          </h2>

          <div className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-medium text-white/90">
                DATA SOURCE
              </p>
              <p className="mt-2 text-xs leading-5 text-white/60">
                CivicIntel published records API
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-white/90">
                GEOGRAPHY
              </p>
              <p className="mt-2 text-xs leading-5 text-white/60">
                {state.name === "FCT"
                  ? "Federal Capital Territory"
                  : `State-level, ${state.name}`}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-white/90">
                PUBLISHED RECORDS
              </p>
              <p className="mt-2 text-xs leading-5 text-white/60">
                {allSelectedRecords.length}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-white/90">
                DATASET IDENTIFIERS
              </p>
              <p className="mt-2 text-xs leading-5 text-white/60">
                {datasetIds.length
                  ? datasetIds.join(", ")
                  : "No dataset identifiers available"}
              </p>
            </div>
          </div>

          {/* <Link
            to="/sources-and-methods"
            className="mt-8 inline-flex items-center gap-4 rounded-full bg-white px-4 py-3 text-xs font-medium text-[#1F7A3F] transition hover:bg-gray-100"
          >
            View revision history
            <span className="text-lg">→</span>
          </Link> */}
        </section>
      </div>
    </main>
  );
}

export default StateDetails;
