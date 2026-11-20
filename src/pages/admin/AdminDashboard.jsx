
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api/api.js";

function AdminDashboard() {
  const [stats, setStats] = useState({
    publishedDatasets: 0,
    pendingQA: 0,
    totalDatasets: 0,
    pendingPublications: 0,
    recentDatasets: [],
    recentConflicts: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [queueData, datasetData, liveDatasetData] =
        await Promise.all([
          apiRequest("/publish-queue"),
          apiRequest("/datasets?limit=100&offset=0"),
          apiRequest("/published?limit=100&offset=0"),
        ]);

        if (!isMounted) return;

        setStats({
          publishedDatasets: liveDatasetData.total ?? 0,

          pendingQA: (datasetData.items ?? []).reduce(
            (total, dataset) => total + (dataset.conflict_count ?? 0),
            0
          ),

          totalDatasets: datasetData.total ?? 0,

          pendingPublications: queueData.total ?? 0,

          recentDatasets: (datasetData.items ?? []).slice(0, 5),
          recentConflicts: (datasetData.items ?? [])
          .filter((dataset) => (dataset.conflict_count ?? 0) > 0)
          .slice(0, 5),
        });
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load dashboard data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleExport = () => {
  const escapeCSV = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const rows = [
    ["CIVICINTEL DASHBOARD REPORT"],
    [],
    ["DASHBOARD SUMMARY"],
    ["Metric", "Value"],
    ["Published Datasets", stats.publishedDatasets],
    ["Data Conflicts", stats.pendingQA],
    ["Total Datasets", stats.totalDatasets],
    ["Pending Publications", stats.pendingPublications],
    [],
    ["RECENT INGESTION ACTIVITY"],
    ["Dataset", "Publisher", "Status", "Date"],
    ...stats.recentDatasets.map((dataset) => [
      dataset.title,
      dataset.publisher || dataset.submitted_by || "Unknown",
      dataset.status || "Unknown",
      dataset.created_at
        ? new Date(dataset.created_at).toLocaleDateString()
        : "Unknown",
    ]),
    [],
    ["RECENT CONFLICTS"],
    ["Dataset", "Conflict Count", "Last Updated"],
    ...stats.recentConflicts.map((dataset) => [
      dataset.title,
      dataset.conflict_count,
      dataset.updated_at
        ? new Date(dataset.updated_at).toLocaleDateString()
        : "Unknown",
    ]),
  ];

  const csvContent = rows
    .map((row) => row.map(escapeCSV).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "civicintel-dashboard-report.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B3C5D]">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Monitor platform activity, data quality and publications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/data"
            className="rounded-full bg-[#1F7A3F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176332]"
          >
            + Add Project
          </Link>

          <button
            type="button"
            onClick={handleExport}
            className="rounded-full border border-[#0B3C5D] px-5 py-3 text-sm font-semibold text-[#0B3C5D] transition hover:bg-[#0B3C5D] hover:text-white"
          >
            Export Data
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">
          Loading dashboard statistics...
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="min-h-[65px] p-4">
                <p className="text-sm font-medium text-[#0B3C5D]">
                  Total Published Datasets
                </p>
              </div>

              <div className="flex min-h-[95px] items-center justify-between bg-[#0B3C5D] p-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {stats.publishedDatasets.toLocaleString()}
                  </h2>

                  <p className="mt-1 text-xs text-white/70">
                    Currently live on the website
                  </p>
                </div>

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0B3C5D]">
                  →
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="min-h-[65px] p-4">
                <p className="text-sm font-medium text-[#0B3C5D]">
                  Data Conflicts
                </p>
              </div>

              <div className="flex min-h-[95px] items-center justify-between bg-[#0B3C5D] p-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {stats.pendingQA.toLocaleString()}
                  </h2>

                  <p className="mt-1 text-xs text-white/70">
                    Reported conflicts across retrieved datasets
                  </p>
                </div>

                <span className="flex h-8 w-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#0B3C5D]">
                  →
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="min-h-[65px] p-4">
                <p className="text-sm font-medium text-[#0B3C5D]">
                  Total Datasets
                </p>
              </div>

              <div className="flex min-h-[95px] items-center justify-between bg-[#0B3C5D] p-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {stats.totalDatasets.toLocaleString()}
                  </h2>

                  <p className="mt-1 text-xs text-white/70">
                    Submitted to the platform
                  </p>
                </div>

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0B3C5D]">
                  →
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="min-h-[65px] p-4">
                <p className="text-sm font-medium text-[#0B3C5D]">
                  Pending Publications
                </p>
              </div>

              <div className="flex min-h-[95px] items-center justify-between bg-[#0B3C5D] p-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {stats.pendingPublications.toLocaleString()}
                  </h2>

                  <p className="mt-1 text-xs text-white/70">
                    Awaiting publication
                  </p>
                </div>

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0B3C5D]">
                  →
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">

            {/* Left column */}
            <div className="space-y-6">
        
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[#0B3C5D]">
                        Recent Ingestion Activity
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        The five most recently submitted or updated datasets.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto w-full">
                    {stats.recentDatasets.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No datasets available.
                      </p>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                            <th className="px-3 py-2 font-semibold">Dataset</th>
                            <th className="px-3 py-2 font-semibold">Publisher</th>
                            <th className="px-3 py-2 font-semibold">Status</th>
                            <th className="px-3 py-2 font-semibold">Date</th>
                          </tr>
                        </thead>

                        <tbody>
                          {stats.recentDatasets.map((dataset) => (
                            <tr
                              key={dataset.id}
                              className="border-b border-gray-100 last:border-0"
                            >
                              <td className="px-3 py-2 text-xs leading-5 font-medium text-gray-800">
                                {dataset.title}
                              </td>

                              <td className="px-3 py-2 text-xs leading-5 text-gray-500">
                                {dataset.publisher || dataset.submitted_by || "Unknown"}
                              </td>

                              <td className="px-3 py-2">
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium capitalize text-gray-600">
                                  {dataset.status?.replace("_", " ") || "Unknown"}
                                </span>
                              </td>

                              <td className="px-3 py-2 text-xs leading-5 text-gray-500">
                                {dataset.created_at
                                  ? new Date(dataset.created_at).toLocaleDateString()
                                  : "Unknown"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#0B3C5D]">
                    Recent Conflicts
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Datasets with figures requiring quality review.
                  </p>
                </div>

                {stats.recentConflicts.length === 0 ? (
                  <div className="rounded-lg bg-gray-50 px-4 py-8 text-center">
                    <p className="text-sm font-medium text-gray-600">
                      No data conflicts found.
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      All currently listed datasets have passed conflict checks.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs uppercase text-gray-400 ">
                          <th className="px-3 py-2 font-semibold">Dataset</th>
                          <th className="px-3 py-2 font-semibold">Conflicts</th>
                          <th className="px-3 py-2 font-semibold">Last Updated</th>
                        </tr>
                      </thead>

                      <tbody>
                        {stats.recentConflicts.map((dataset) => (
                          <tr
                            key={dataset.id}
                            className="border-b border-gray-100 last:border-0"
                          >
                            <td className="px-3 py-2 text-xs leading-5 font-medium text-gray-800">
                              {dataset.title}
                            </td>
                            <td className="px-3 py-2 text-xs font-semibold text-red-600 text-center">
                              {dataset.conflict_count}
                            </td>

                            <td className="px-3 py-2 text-xs leading-5 text-gray-500 text-center">
                              {dataset.updated_at
                                ? new Date(dataset.updated_at).toLocaleDateString()
                                : "Unknown"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#0B3C5D]">
                  Publish Progress
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Overview of dataset publication progress.
                </p>

                <div className="mt-8 flex flex-col items-center">
                  <div className="relative flex h-32 w-56 items-center justify-center overflow-hidden">
                    {/* Gauge background */}
                    <div
                      className="relative h-28 w-56 overflow-hidden"
                    >
                      <div className="absolute inset-0 rounded-t-full border-[14px] border-b-0 border-[#E7ECEF]" />

                      <div
                        className="absolute inset-0 rounded-t-full border-[14px] border-b-0 border-[#1F7A3F]"
                        style={{
                          clipPath: `inset(0 ${100 - (
                            stats.totalDatasets > 0
                              ? Math.min(
                                  (stats.publishedDatasets / stats.totalDatasets) * 100,
                                  100
                                )
                              : 0
                          )}% 0 0)`,
                        }}
                      />
                    </div>

                    <div className="absolute bottom-0 text-center">
                      <p className="text-3xl font-bold text-[#0B3C5D]">
                        {stats.totalDatasets > 0
                          ? Math.round(
                              (stats.publishedDatasets / stats.totalDatasets) * 100
                            )
                          : 0}%
                      </p>
                      <p className="text-xs text-gray-500">
                        Published
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex w-full justify-between text-sm">
                    <span className="text-gray-500">Published</span>
                    <span className="font-semibold text-[#0B3C5D]">
                      {stats.publishedDatasets.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2 flex w-full justify-between text-sm">
                    <span className="text-gray-500">Total datasets</span>
                    <span className="font-semibold text-[#0B3C5D]">
                      {stats.totalDatasets.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#0B3C5D]">
                  Analytics & Reports
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Dataset overview across the platform.
                </p>

                <div className="mt-8">
                  {(() => {
                    const items = [
                      {
                        label: "Published",
                        value: stats.publishedDatasets,
                        color: "#1F7A3F",
                      },
                      {
                        label: "Pending",
                        value: stats.pendingPublications,
                        color: "#D6A756",
                      },
                      {
                        label: "Conflicts",
                        value: stats.pendingQA,
                        color: "#C73284",
                      },
                    ];

                    const maximum = Math.max(...items.map((item) => item.value), 1);

                    return (
                      <div className="flex h-48 items-end justify-around gap-5 border-b border-gray-200 px-2">
                        {items.map((item) => (
                          <div
                            key={item.label}
                            className="flex h-full flex-1 flex-col items-center justify-end"
                          >
                            <span className="mb-2 text-sm font-semibold text-[#0B3C5D]">
                              {item.value.toLocaleString()}
                            </span>

                            <div className="flex h-32 w-full items-end justify-center">
                              <div
                                className="w-10 rounded-t-md transition-all"
                                style={{
                                  height: `${(item.value / maximum) * 100}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                            </div>

                            <span className="mt-3 text-xs font-medium text-gray-500">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#0B3C5D]">
                  Reminders
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Items that may need your attention.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3 rounded-lg bg-[#F8FAFC] p-4">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#D6A756]" />

                    <div>
                      <p className="text-sm font-semibold text-[#0B3C5D]">
                        Pending publications
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {stats.pendingPublications.toLocaleString()} datasets awaiting publication.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-[#F8FAFC] p-4">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#C73284]" />

                    <div>
                      <p className="text-sm font-semibold text-[#0B3C5D]">
                        Data conflicts
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {stats.pendingQA.toLocaleString()} reported conflicts across retrieved datasets.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-[#F8FAFC] p-4">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#1F7A3F]" />

                    <div>
                      <p className="text-sm font-semibold text-[#0B3C5D]">
                        Platform datasets
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {stats.totalDatasets.toLocaleString()} datasets currently registered.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
          </div>

          

        </div>

        

        
      )}
    </div>
  );
}

export default AdminDashboard;

