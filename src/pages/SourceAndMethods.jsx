
import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileSearch,
  History,
  ShieldCheck,
  Scale,
} from "lucide-react";

import { getSourcesAndMethods } from "../services/sourcesAndMethodsServices.js";
import SourceHero from "../assets/Source.hero.png";
import SourcePic1 from "../assets/source.png";

const sections = [
  { label: "Source hierarchy", href: "#source-hierarchy" },
  { label: "Methodology", href: "#methodology" },
  { label: "Revision History", href: "#revision-history" },
  { label: "How to interpret data", href: "#interpret-data" },
];

const sources = [
  {
    title: "National surveys & censuses",
    description:
      "Primary sources as the NDHS — preferred where available, most rigorous sampling.",
  },
  {
    title: "Federal administrative data",
    description:
      "Ministry and agency records (e.g. FMOH, FME, UBEC) — used where survey data is unavailable or needs corroboration.",
  },
  {
    title: "State-level administrative data",
    description:
      "Used for state-specific detail not captured nationally, always labeled by originating state.",
  },
  {
    title: "Independent/third-party sources",
    description:
      "e.g. BudgIT for budget data, examination bodies (WAEC/NECO/JAMB) for results — used within their domain of authority.",
  },
];

const methods = [
  {
    icon: FileSearch,
    title: "Source selection",
    description:
      "Preference follows the hierarchy above; the most authoritative available source for a given indicator and geography is used.",
  },
  {
    icon: ShieldCheck,
    title: "Verification",
    description:
      "Each figure is checked against the original publisher document before appearing on the platform, with a verification date recorded.",
  },
  {
    icon: Scale,
    title: "Conflicting values",
    description:
      "When two credible sources disagree, CivicIntel does not average them — both are flagged and the conflict is documented, not silently resolved.",
  },
  {
    icon: BookOpen,
    title: "Publications",
    description:
      "Data moves through Draft → In Review → QA → Approved → Published; nothing appears on the public site before Published status.",
  },
];

const interpretations = [
  {
    title: "Indicator",
    description:
      'A defined, measurable statistic (e.g. "ANC 4+ Coverage") with a consistent definition across states and years.',
  },
  {
    title: "Vintage",
    description:
      "The year the underlying data collection took place — not necessarily the year it was published or verified.",
  },
  {
    title: "State-level data",
    description:
      "Figures attributed to a specific state; national figures are aggregates and are labeled separately.",
  },
  {
    title: "Missing values",
    description:
      'Shown explicitly as "not available" rather than estimated or interpolated.',
  },
  {
    title: "Verification",
    description:
      "Confirms the figure matches its original source document — it does not certify the source's own accuracy.",
  },
];

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function SectionTitle({ children, light = false }) {
  return (
    <h2
      className={`mb-6 flex items-center gap-2 text-lg font-bold uppercase tracking-tight sm:text-xl ${
        light ? "text-white" : "text-[#101820]"
      }`}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          light ? "bg-white" : "bg-[#1F7A3F]"
        }`}
      />
      {children}
    </h2>
  );
}

function SourcesAndMethods() {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const data = await getSourcesAndMethods();

        if (!cancelled) {
          setRevisions(
            Array.isArray(data.revisionHistory)
              ? data.revisionHistory
              : []
          );
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#062638] text-[#E7EDF0]"> 
      
      
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 lg:px-12 lg:py-32 pt-24">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:gap-12">
            {/* Hero text */}
            <div className="w-full md:w-1/2">
            <h1 className="text-4xl font-bold leading-tight tracking-normal text-white/80 sm:text-4xl lg:7xl">
                Sources &amp;
                <br />
                Methodology
            </h1>

            <p className="mt-4 max-w-md text-xs leading-5 text-[#E7EDF0] sm:text-sm">
                How CivicIntel selects, verifies, and publishes health and
                education data for Nigeria — and how to interpret what you see.
            </p>
            </div>

            {/* Hero image */}
            <div className="w-full md:w-1/2">
            <img
                src={SourceHero}
                alt="Open source written on a typewriter"
                className="h-[220px] w-full rounded-lg object-cover sm:h-[300px] lg:h-[350px]"
            />
            </div>
        </div>
        </section>


      {/* Compact pill navigation */}
      <nav
        aria-label="Sources and methods sections"
        className="flex flex-wrap items-center justify-center gap-3 bg-white px-4 py-6 sm:gap-8 sm:py-7"
      >
        {sections.map((section) => (
          <a
            key={section.href}
            href={section.href}
            className="rounded-full border border-[#1F7A3F] px-3 py-1.5 text-xs font-semibold text-[#1F7A3F] transition hover:bg-[#1F7A3F] hover:text-white sm:px-4 sm:text-sm"
          >
            {section.label}
          </a>
        ))}
      </nav>

      {/* Source hierarchy */}
      <section
        id="source-hierarchy"
        className="scroll-mt-6 bg-[#E7ECF0] px-5 py-8 sm:px-8 sm:py-10 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle>Source Hierarchy</SectionTitle>

          <div className="grid items-center gap-8 md:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <img
              src= {SourcePic1}
              alt="Geometric balancing sculpture representing a hierarchy of sources"
              className="h-75 w-full rounded-xl object-cover sm:h-88.75"
            />

            <div>
              {sources.map((source, index) => (
                <article
                  key={source.title}
                  className="flex gap-3 border-b border-[#C3CBD1] py-5 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1F7A3F] text-[10px] font-bold text-white">
                    {index + 1}
                  </span>

                  <div>
                    <h3 className="text-xs font-semibold text-[#101820] sm:text-sm">
                      {source.title}
                    </h3>

                    <p className="mt-1 text-[10px] leading-[1.65] text-[#68747D] sm:text-xs">
                      {source.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Methodology: dark band with four columns */}
      <section
        id="methodology"
        className="scroll-mt-3 bg-[#061B28] px-5 py-8 text-white sm:px-8 sm:py-10 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle light>Methodology</SectionTitle>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {methods.map((method) => {
              const Icon = method.icon;

              return (
                <article
                  key={method.title}
                  className="flex items-start gap-3"
                >
                  <Icon className="mt-0.5 h-6 w-6 shrink-0 text-white" />

                  <div>
                    <h3 className="text-xs font-bold sm:text-sm">
                      {method.title}
                    </h3>

                    <p className="mt-2 text-[10px] leading-[1.7] text-slate-300 sm:text-xs">
                      {method.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Revision history: compact three-column cards */}
      <section
        id="revision-history"
        className="scroll-mt-6 bg-[#E7ECF0] px-5 py-8 sm:px-8 sm:py-10 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle>Revision History</SectionTitle>

          {loading ? (
            <p className="py-8 text-sm text-slate-500">
              Loading revision history...
            </p>
          ) : error ? (
            <p role="alert" className="py-8 text-sm text-red-700">
              Revision history could not be loaded. Please try again later.
            </p>
          ) : revisions.length === 0 ? (
            <p className="py-8 text-sm text-slate-500">
              No revision history is currently available.
            </p>
          ) : (
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {revisions.map((revision) => (
                <article
                  key={revision.id}
                  className="overflow-hidden rounded-2xl border border-[#D1D6DA] bg-white"
                >
                  <img
                    src={
                      revision.imageUrl ||
                      "/images/revision-placeholder.jpg"
                    }
                    alt=""
                    className="h-36 w-full object-cover sm:h-32"
                  />

                  <div className="p-3">
                    <h3 className="min-h-8 text-[10px] leading-relaxed text-[#68747D] sm:text-xs">
                      {revision.title}
                    </h3>

                    {revision.description && (
                      <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                        {revision.description}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#B8CBD6] px-3 py-1 text-[10px] font-medium text-[#173F56]">
                        {formatDate(revision.verifiedAt)}
                      </span>

                      {revision.status && (
                        <span className="text-[10px] text-slate-500">
                          {revision.status}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Interpretation: five narrow cards */}
      <section
        id="interpret-data"
        className="scroll-mt-6 bg-[#E7ECF0] px-5 pb-12 pt-5 sm:px-8 sm:pb-14 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle>How to interpret CivicIntel data</SectionTitle>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
            {interpretations.map((item, index) => (
              <article
                key={item.title}
                className="min-h-[150px] border-l-[4px] border-[#0B3C5D] px-4 py-3 text-center sm:min-h-[165px]"
              >
                <span className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#1F7A3F] text-[10px] font-bold text-white">
                  {index + 1}
                </span>

                <h3 className="mt-3 text-xs font-bold text-[#101820]">
                  {item.title}
                </h3>

                <p className="mt-2 text-[10px] leading-[1.7] text-[#68747D] sm:text-xs">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default SourcesAndMethods;
