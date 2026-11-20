
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api/api.js";

function AdminDataIngest() {
  const [datasets, setDatasets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDatasets() {
      try {
        setLoading(true);
        setError("");

        const datasetData = await apiRequest(
          "/datasets?limit=100&offset=0"
        );

        if (!isMounted) return;

        setDatasets(datasetData.items ?? []);
        setTotal(datasetData.total ?? 0);
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load datasets.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDatasets();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleExport = () => {
  if (datasets.length === 0) return;

  const headers = [
    "Dataset",
    "Publisher",
    "Status",
    "Date Submitted",
    "Conflicts",
  ];

  const rows = datasets.map((dataset) => [
    dataset.title || "Untitled dataset",
    dataset.publisher || dataset.submitted_by || "Unknown",
    dataset.status || "Unknown",
    dataset.created_at
      ? new Date(dataset.created_at).toLocaleDateString()
      : "Unknown",
    dataset.conflict_count ?? 0,
  ]);

  const escapeCSV = (value) =>
    `"${String(value).replace(/"/g, '""')}"`;

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "civicintel-datasets.csv";

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
                Data Ingest
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                Review and manage datasets submitted to CivicIntel.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                
                <Link
                to="/admin-preview/upload"
                className="inline-flex items-center gap-2 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176332]"
                >
                    <span className="text-lg leading-none">+</span>
                    Add Project
                </Link>

                <button
                type="button"
                onClick={handleExport}
                disabled={datasets.length === 0}
                className="rounded-full border border-[#1F7A3F] px-6 py-3 text-sm font-semibold text-[#1F7A3F] transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Export Data
                </button>
            </div>
        </div>


      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#0B3C5D]">
            Recent Ingestion Activity
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Review submitted datasets, publishers and their current status.
          </p>

          <p className="mt-4 text-sm font-semibold text-[#0B3C5D]">
            Total datasets: {total.toLocaleString()}
          </p>
        </div>

        {loading && (
          <p className="text-sm text-gray-500">
            Loading datasets...
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            {datasets.length === 0 ? (
              <p className="text-sm text-gray-500">
                No datasets available.
              </p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                    <th className="px-3 py-3 font-semibold">Dataset</th>
                    <th className="px-3 py-3 font-semibold">Publisher</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">Date Submitted</th>
                    <th className="px-3 py-3 text-center font-semibold">Conflicts</th>
                  </tr>
                </thead>

                <tbody>
                  {datasets.map((dataset) => (
                    <tr
                      key={dataset.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-3 py-3 text-sm font-medium text-gray-800">
                        {dataset.title || "Untitled dataset"}
                      </td>

                      <td className="px-3 py-3 text-sm text-gray-500">
                        {dataset.publisher || dataset.submitted_by || "Unknown"}
                      </td>

                      <td className="px-3 py-3">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600">
                          {dataset.status?.replace("_", " ") || "Unknown"}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-sm text-gray-500">
                        {dataset.created_at
                          ? new Date(dataset.created_at).toLocaleDateString()
                          : "Unknown"}
                      </td>

                      <td className="px-3 py-3 text-center text-sm font-semibold text-gray-600">
                        {dataset.conflict_count ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDataIngest;
