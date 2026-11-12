
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getMediaById } from "../api/media.js";

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
      <main className="flex min-h-[60vh] items-center justify-center bg-[#E7ECEF] px-5">
        <p className="text-sm text-[#0B3C5D]">
          Loading report...
        </p>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#E7ECEF] px-5 text-center">
        <h1 className="text-2xl font-bold text-[#0B3C5D]">
          Report unavailable
        </h1>

        <p className="mt-3 text-sm text-gray-600">
          {error || "This report could not be found."}
        </p>

        <Link
          to="/media"
          className="mt-6 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176331]"
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

  return (
    <main className="min-h-screen bg-[#E7ECEF] text-[#082B40] mt-8">
      {/* REPORT CONTENT */}
      <article className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        {/* BACK LINK */}
        <Link
          to="/media"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F7A3F] transition hover:underline"
        >
          
          Back to Media
        </Link>

        {/* REPORT HEADER */}
        <header className="mt-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F7A3F]">
            {report.category || "CivicIntel Report"}
          </p>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-[#0B3C5D] sm:text-4xl lg:text-5xl">
            {report.title}
          </h1>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-600">
            <p>
              <span className="font-semibold text-[#14552E]">
                Published:
              </span>{" "}
              {publishedDate}
            </p>

            {report.source && (
              <p>
                <span className="font-semibold text-[#14552E]">
                  Source:
                </span>{" "}
                {report.source}
              </p>
            )}
          </div>
        </header>

        {/* FEATURE IMAGE */}
        {report.image_url && (
          <div className="mt-10 overflow-hidden rounded-tl-[52px] rounded-br-[52px] bg-gray-300">
            <img
              src={report.image_url}
              alt={report.title}
              className="max-h-130 w-full object-cover"
            />
          </div>
        )}

        {/* FULL REPORT */}
        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm sm:p-10">
          {report.content ? (
            <div className="whitespace-pre-wrap wrap-break-word text-base leading-8 text-gray-700">
              {report.content}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No full article content is available for this report yet.
            </p>
          )}
        </section>

        {/* FOOTER */}
        <div className="mt-10 border-t border-gray-300 pt-6">
          <p className="text-sm text-gray-600">
            Published by CivicIntel.
          </p>

          <Link
            to="/media"
            className="mt-3 inline-block text-sm font-semibold text-[#1F7A3F] hover:underline"
          >
            Explore more media releases →
          </Link>
        </div>
      </article>
    </main>
  );
}

export default MediaDetails;
