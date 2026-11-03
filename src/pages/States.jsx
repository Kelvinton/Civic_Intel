
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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

import {
  revealVariants,
  useMotionSettings,
} from "../animation.js";

import { getStates } from "../api/referenceData.js";
import { getAllPublishedRecords } from "../api/publishedData.js";


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

function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

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

function getLatestRecord(records, stateName, indicatorKey, selectedYear) {
  const matchingRecords = records.filter((record) => {
    return (
      normalizeStateName(record.state) ===
        normalizeStateName(stateName) &&
      record.indicator_key === indicatorKey &&
      (selectedYear === "latest" ||
        String(record.year) === selectedYear)
    );
  });

  if (!matchingRecords.length) return null;

  return matchingRecords.reduce((latest, current) =>
    Number(current.year) > Number(latest.year) ? current : latest
  );
}

function formatValue(record) {
  if (!record || record.value == null) {
    return "Not available";
  }

  const value = Number(record.value);

  if (!Number.isFinite(value)) return "Not available";

  const formatted = new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 2,
  }).format(value);

  return record.unit === "%"
    ? `${formatted}%`
    : `${formatted} ${record.unit || ""}`.trim();
}

function States() {
  const [indicator, setIndicator] = useState("health");
  const [year, setYear] = useState("latest");
  const [search, setSearch] = useState("");
  const [initialStates, setInitialStates] = useState([]);

  const [states, setStates] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [educationRecords, setEducationRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const motionSettings = useMotionSettings();

  useEffect(() => {
    let isMounted = true;

    async function loadDirectory() {
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

        const allStates = Array.isArray(statesData) ? statesData : [];

        setStates(allStates);

        const shuffledStates = [...allStates].sort(
          () => Math.random() - 0.5
        );

        setInitialStates(shuffledStates.slice(0, 9));
        setHealthRecords(healthData);
        setEducationRecords(educationData);
      } catch (err) {
        if (!isMounted) return;

        console.error("Failed to load state directory:", err);
        setError(
          err.message || "Unable to load state directory data."
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDirectory();

    return () => {
      isMounted = false;
    };
  }, []);

  const allRecords = useMemo(
    () => [...healthRecords, ...educationRecords],
    [healthRecords, educationRecords]
  );

  const availableYears = useMemo(() => {
    return [
      ...new Set(
        allRecords
          .map((record) => String(record.year))
          .filter(Boolean)
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [allRecords]);

  // Search all 37 states when the user enters a search.
  const filteredStates = useMemo(() => {
    const query = search.trim().toLowerCase();
      
      if (query) {
        return states.filter((state) =>
          state.name.toLowerCase().includes(query)
        );
      }
      // Otherwise, show only the initial 9 states.
      return initialStates;
  }, [states, search, initialStates]);

  

  const activeRecords =
    indicator === "health" ? healthRecords : educationRecords;

  const activeIndicatorKey =
    indicator === "health"
      ? "anc4_pct"
      : "primary_completion_pct";

  const activeIndicatorLabel =
    indicator === "health"
      ? "ANC 4+ coverage"
      : "Primary completion rate";

  const secondaryRecords =
    indicator === "health" ? educationRecords : healthRecords;

  const secondaryIndicatorKey =
    indicator === "health"
      ? "primary_completion_pct"
      : "anc4_pct";

  const secondaryIndicatorLabel =
    indicator === "health"
      ? "Primary completion rate"
      : "ANC 4+ coverage";

  return (
    <main className="min-h-screen bg-[#E7EDF0] pt-18 text-[#0B3C5D] sm:pt-20">
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-8 md:pb-24 lg:px-12 lg:py-12">

        {/* Hero */}
        <motion.div
          variants={revealVariants}
          initial={motionSettings.initial}
          animate="visible"
          className="grid items-center gap-8 min-[850px]:grid-cols-2"
        >
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
              Browse Nigeria's 36 states and the FCT. Explore
              published health and education indicators with
              reporting years and source attribution.
            </p>
          </div>

          <motion.div
            initial={
              motionSettings.initial === false
                ? false
                : { opacity: 0, scale: 0.94, y: 18 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.1,
            }}
            className="h-56 overflow-hidden rounded-xl bg-[#0B3C5D] sm:h-72 lg:h-80"
          >
            <img
              src={StateHero}
              alt="Organised public records and documents"
              className="h-full w-full object-cover"
            />
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div
          {...motionSettings}
          variants={revealVariants}
          className="relative z-10 mx-auto -mt-5 grid max-w-4xl gap-5 rounded-2xl bg-[#0B3C5D] p-5 text-white shadow-lg sm:grid-cols-2 sm:p-6"
        >
          <label className="flex flex-col gap-3 text-sm font-semibold">
            Indicator

            <select
              value={indicator}
              onChange={(event) => setIndicator(event.target.value)}
              className="rounded-xl bg-white px-4 py-3 font-normal text-[#0B3C5D] outline-none"
            >
              <option value="health">ANC 4+ Coverage</option>
              <option value="education">Primary Completion Rate</option>
            </select>
          </label>

          <label className="flex flex-col gap-3 text-sm font-semibold">
            Year

            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="rounded-xl bg-white px-4 py-3 font-normal text-[#0B3C5D] outline-none"
            >
              <option value="latest">Latest available</option>

              {availableYears.map((availableYear) => (
                <option key={availableYear} value={availableYear}>
                  {availableYear}
                </option>
              ))}
            </select>
          </label>
        </motion.div>

        <motion.p
          {...motionSettings}
          variants={revealVariants}
          className="mt-5 text-center text-xs text-gray-500"
        >
          Showing published {activeIndicatorLabel.toLowerCase()} records.
          Reporting years are displayed for each state.
        </motion.p>

        {/* Search */}
        <motion.div
          {...motionSettings}
          variants={revealVariants}
          className="mb-8 mt-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
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
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center text-sm text-gray-500">
            Loading state directory and published records...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl bg-white p-6 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {/* State cards */}
        {!loading && !error && (
          <>
            <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStates.map((state) => {
                const valueRecord = getLatestRecord(
                  activeRecords,
                  state.name,
                  activeIndicatorKey,
                  year
                );

                const secondaryRecord = getLatestRecord(
                  secondaryRecords,
                  state.name,
                  secondaryIndicatorKey,
                  year
                );

                const slug = createSlug(state.name);

                return (
                  <motion.div
                    key={state.id}
                    variants={revealVariants}
                    initial={motionSettings.initial}
                    whileInView="visible"
                    viewport={motionSettings.viewport}
                    className="min-w-0"
                  >
                    <Link
                      to={`/states/${slug}`}
                      className="group block min-w-0 text-white transition-transform duration-200 hover:-translate-y-1"
                    >
                      <div className="relative mx-2 mb-0 h-44 rounded-xl bg-[#416B84] sm:h-48">
                        <img
                          src={stateImages[slug] || StateHero}
                          alt={`${state.name} — state profile`}
                          loading="lazy"
                          className="absolute -bottom-9 left-5 h-48 w-[calc(100%-8px)] rounded-xl object-cover shadow-sm transition-transform group-hover:scale-[1.02] sm:h-52"
                        />
                      </div>

                      <div className="relative mx-1 mt-12 bg-[#061D2A] px-4 pb-4 pt-3">
                        <h3 className="font-semibold">
                          {state.name === "FCT"
                            ? "Federal Capital Territory"
                            : `${state.name} State`}
                        </h3>

                        <p className="mt-1 text-[11px] text-white/60">
                          {state.zone}
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm font-medium">
                              {formatValue(valueRecord)}
                            </p>

                            <p className="mt-1 text-[9px] uppercase text-white/60">
                              {activeIndicatorLabel}
                            </p>

                            <p className="mt-1 text-[10px] text-white/50">
                              {valueRecord
                                ? `Year: ${valueRecord.year}`
                                : "No published record"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium">
                              {formatValue(secondaryRecord)}
                            </p>

                            <p className="mt-1 text-[9px] uppercase text-white/60">
                              {secondaryIndicatorLabel}
                            </p>

                            <p className="mt-1 text-[10px] text-white/50">
                              {secondaryRecord
                                ? `Year: ${secondaryRecord.year}`
                                : "No published record"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs">
                          <span className="text-white/80">
                            {state.zone}
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
                  </motion.div>
                );
              })}
            </div>

            {filteredStates.length === 0 && (
              <p className="py-12 text-center text-gray-600">
                No matching states found. Try another search.
              </p>
            )}

            {/* <motion.p
              {...motionSettings}
              variants={revealVariants}
              className="mt-10 text-center text-xs text-gray-500"
            >
              {search.trim()
              ? `Found ${filteredStates.length} matching locations out of ${states.length}.`
              : `Showing 9 randomly selected locations out of ${states.length}.`}
            </motion.p> */}
          </>
        )}
      </section>
    </main>
  );
}

export default States;
