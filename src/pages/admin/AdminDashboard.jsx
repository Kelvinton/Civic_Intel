
import { useEffect, useState } from "react";
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0B3C5D]">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Plan, prioritize and accomplish your tasks with ease.
        </p>
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
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Total Published Datasets
              </p>

              <h2 className="mt-3 text-3xl font-bold text-[#0B3C5D]">
                {stats.publishedDatasets.toLocaleString()}
              </h2>

              <p className="mt-2 text-xs text-gray-400">
                Datasets currently live on the website
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Pending Q/A
              </p>

              <h2 className="mt-3 text-3xl font-bold text-[#0B3C5D]">
                {stats.pendingQA.toLocaleString()}
              </h2>

              <p className="mt-2 text-xs text-gray-400">
                Total data conflicts requiring attention
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Data Sets
              </p>

              <h2 className="mt-3 text-3xl font-bold text-[#0B3C5D]">
                {stats.totalDatasets.toLocaleString()}
              </h2>

              <p className="mt-2 text-xs text-gray-400">
                Total datasets submitted to the platform
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Pending Publications
              </p>

              <h2 className="mt-3 text-3xl font-bold text-[#0B3C5D]">
                {stats.pendingPublications.toLocaleString()}
              </h2>

              <p className="mt-2 text-xs text-gray-400">
                Approved datasets awaiting publication
              </p>
            </div>
          </div>
        
          <div className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
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
                        <th className="px-4 py-3 font-semibold">Dataset</th>
                        <th className="px-4 py-3 font-semibold">Publisher</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {stats.recentDatasets.map((dataset) => (
                        <tr
                          key={dataset.id}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="px-4 py-4 text-sm font-medium text-gray-800">
                            {dataset.title}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-500">
                            {dataset.publisher || dataset.submitted_by || "Unknown"}
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-600">
                              {dataset.status?.replace("_", " ") || "Unknown"}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-500">
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

          <div className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
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
                    <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                      <th className="px-4 py-3 font-semibold">Dataset</th>
                      <th className="px-4 py-3 font-semibold">Conflicts</th>
                      <th className="px-4 py-3 font-semibold">Last Updated</th>
                    </tr>
                  </thead>

                  <tbody>
                    {stats.recentConflicts.map((dataset) => (
                      <tr
                        key={dataset.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-gray-800">
                          {dataset.title}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-red-600">
                          {dataset.conflict_count}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-500">
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

        

        
      )}
    </div>
  );
}

export default AdminDashboard;

