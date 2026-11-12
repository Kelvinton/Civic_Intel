
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getMediaById } from "../api/media.js";

const API_BASE_URL = "https://backend-production-91cb.up.railway.app";



function formatArticleContent(content) {
  if (!content) return [];

  const headings = [
    "Why the campaign matters",
    "The cVPV2 situation",
    "Why these locations were prioritized",
    "References",
  ];

  let formattedContent = content;

  // Put section headings on separate lines.
  headings.forEach((heading) => {
    const escapedHeading = heading.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    formattedContent = formattedContent.replace(
      new RegExp(`\\s+(${escapedHeading})\\s+`, "gi"),
      "\n\n$1\n"
    );
  });

  // Separate paragraphs using the existing double spaces.
  return formattedContent
    .split(/\s{2,}|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}


function MediaDetails() {
  const { mediaId } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadReport() {
      try {
        setLoading(true);
        setError("");

        const data = await getMediaById(mediaId);
        console.log("MEDIA ARTICLE:", data);
        console.log("FULL ARTICLE CONTENT:", data.content);

        if (isMounted) {
          setReport(data);
        }
      } catch (err) {
        if (!isMounted) return;

        console.error("Failed to load media report:", err);
        setError(
          err.message || "Unable to load this report."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      isMounted = false;
    };
  }, [mediaId]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#E7ECEF] px-5">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#1F7A3F] border-t-transparent" />
          <p className="text-sm font-medium text-[#0B3C5D]">
            Loading report...
          </p>
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#E7ECEF] px-5 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F7A3F]">
          CivicIntel Media
        </p>

        <h1 className="mt-4 text-3xl font-bold text-[#0B3C5D]">
          Report unavailable
        </h1>

        <p className="mt-3 max-w-md text-sm leading-7 text-gray-600">
          {error || "This report could not be found."}
        </p>

        <Link
          to="/media"
          className="mt-7 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176331]"
        >
          Back to Media
        </Link>
      </main>
    );
  }

  const publishedDate = report.published_on
    ? new Date(report.published_on).toLocaleDateString(
        "en-NG",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "Date not available";

  const imageUrl = report.image_url
    ? report.image_url.startsWith("http")
      ? report.image_url
      : `${API_BASE_URL}${report.image_url}`
    : null;

  return (
    <main className="min-h-screen bg-[#F4F6F7] pt-8 text-[#082B40]">

      {/* TOP NAVIGATION */}
      <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8 lg:px-12 mt-8">
        <Link
          to="/media"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F7A3F] transition hover:gap-3"
        >
          
          Back to Media
        </Link>
      </div>

      {/* ARTICLE HEADER */}
      <header className="mx-auto max-w-5xl px-5 pb-10 pt-12 text-center sm:px-8 sm:pt-16">

        <div className="flex justify-center">
          <span className="rounded-full border border-[#1F7A3F]/20 bg-[#1F7A3F]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1F7A3F]">
            {report.category || "CivicIntel Report"}
          </span>
        </div>

        <h1 className="mx-auto mt-7 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-[#0B3C5D] sm:text-4xl lg:text-5xl">
          {report.title}
        </h1>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs text-gray-500">
          <span className="font-semibold text-[#14552E]">
            CIVICINTEL
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-gray-400 sm:block" />

          <span>Published {publishedDate}</span>
        </div>

        <div className="mx-auto mt-8 h-1 w-16 rounded-full bg-[#1F7A3F]" />
      </header>

      {/* FEATURE IMAGE */}
      {imageUrl && (
        <div className="mx-auto mt-10 max-w-5xl px-5 sm:px-8 lg:px-12">
          <figure>
            <div className="overflow-hidden rounded-xl bg-[#E7ECEF] shadow-sm">
              <img
                src={imageUrl}
                alt={report.title}
                className="block max-h-155 min-h-155 w-full object-cover object-center"
              />
            </div>

            <figcaption className="mt-3 text-center text-xs leading-6 text-gray-500">
              {report.title}
            </figcaption>
          </figure>
        </div>
      )}

      {/* ARTICLE CONTENT */}
      <article className="mx-auto max-w-4xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16">

        {/* SOURCE INFORMATION */}
        {report.source && (
          <div className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F7A3F]">
              Sources & References
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {report.source.split(",").map((source, index) => (
                <span
                  key={index}
                  className="rounded-full border border-[#0B3C5D]/10 bg-[#E7ECEF] px-4 py-2 text-sm font-medium text-[#0B3C5D]"
                >
                  {source.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ARTICLE BODY */}
        <section className="rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-12">

          <div className="mb-8 flex items-center gap-3">
            <span className="h-6 w-1 rounded-full bg-[#1F7A3F]" />

            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#0B3C5D]">
              Article
            </h2>
          </div>

          {report.description && (
            <p className="mb-8 border-b border-gray-100 pb-8 text-lg font-medium leading-8 text-[#0B3C5D]">
              {report.description}
            </p>
          )}

          
          {report.content ? (
            <div className="space-y-6">
              {formatArticleContent(report.content).map(
                (paragraph, index) => {
                  const isHeading = [
                    "Why the campaign matters",
                    "The cVPV2 situation",
                    "Why these locations were prioritized",
                    "References",
                  ].some(
                    (heading) =>
                      heading.toLowerCase() === paragraph.toLowerCase()
                  );

                  return isHeading ? (
                    <h3
                      key={index}
                      className="border-l-4 border-[#1F7A3F] pl-4 pt-2 text-xl font-bold leading-snug text-[#0B3C5D] sm:text-2xl"
                    >
                      {paragraph}
                    </h3>
                  ) : (
                    <p
                      key={index}
                      className={`wrap-break-word text-[16px] leading-8 text-gray-700 sm:text-[17px] sm:leading-9 ${
                        index === 0
                          ? "text-lg font-medium text-[#0B3C5D]"
                          : ""
                      }`}
                    >
                      {paragraph}
                    </p>
                  );
                }
              )}
            </div>
          ) : (
            <p className="text-sm leading-7 text-gray-500">
              The full article content is not available yet.
            </p>
          )}

        </section>

        {/* PUBLICATION FOOTER */}
        <footer className="mt-12 overflow-hidden rounded-2xl bg-[#0B3C5D] p-7 text-white sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8FD3A7]">
            CivicIntel
          </p>

          <h2 className="mt-4 text-xl font-bold sm:text-2xl">
            Exploring Nigeria Through Health & Education Data
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">
            Sourced, dated, and verifiable information to support
            a better understanding of Nigeria's public data.
          </p>

          <Link
            to="/media"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0B3C5D] transition hover:bg-[#E7ECEF]"
          >
            Explore more releases
            <span aria-hidden="true">→</span>
          </Link>
        </footer>

      </article>
    </main>
  );
}

export default MediaDetails;
