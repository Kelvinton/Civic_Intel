
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { ArrowLeft, ArrowRight, FileSpreadsheet } from "lucide-react";

function AdminDatasetPreview() {
  const location = useLocation();
  const navigate = useNavigate();

  const file = location.state?.file;
  const metadata = location.state?.metadata;
  const fileUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file]
    );

    useEffect(() => {
    return () => {
        if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
    }, [fileUrl]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const readFile = async () => {
      if (!file) {
        setLoading(false);
        return;
      }

      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        const data = XLSX.utils.sheet_to_json(firstSheet, {
          defval: "",
        });

        if (!data.length) {
          setError("No data rows were found in this file.");
          return;
        }

        const getValue = (row, possibleNames) => {
          const key = Object.keys(row).find((column) =>
            possibleNames.includes(column.trim().toLowerCase())
          );

          return key ? row[key] : "";
        };

        const previewRows = data.slice(0, 10).map((row) => ({
          state: getValue(row, ["state", "states", "location"]),
          indicator: getValue(row, ["indicator", "indicator name", "metric"]),
          value: getValue(row, ["value", "result", "rate"]),
          year: getValue(row, ["year", "vintage"]),
        }));

        setRows(previewRows);
      } catch {
        setError("Unable to read this dataset. Please check the file format.");
        } finally {
        setLoading(false);
      }
    };

    readFile();
  }, [file]);

  if (!file || !metadata) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-[#0B3C5D]">
          Preview unavailable
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Please upload a file and complete the metadata first.
        </p>
        <button
          type="button"
          onClick={() => navigate("/admin-preview/upload")}
          className="mt-5 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-semibold text-white"
        >
          Back to Upload
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Workflow steps */}
      <div className="mb-8 overflow-x-auto rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex min-w-[650px] items-center justify-between">
          {["Upload", "Metadata", "Preview", "Verification", "Q/A", "Publish"].map(
            (step, index) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                      index <= 2
                        ? "bg-[#1F7A3F] text-white"
                        : "bg-[#E7ECEF] text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      index <= 2
                        ? "text-[#1F7A3F]"
                        : "text-gray-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>

                {index !== 5 && (
                  <div className="mx-3 mb-5 h-px flex-1 bg-gray-200" />
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B3C5D]">
          Preview
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Parsed rows before verification. Raw file remains preserved
          regardless of edits here.
        </p>
      </div>

      {/* Preview table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="py-12 text-center text-sm text-gray-500">
            Reading dataset...
          </p>
        ) : error ? (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">
            No preview rows available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left text-gray-500">
                  <th className="px-3 py-4 font-semibold">State</th>
                  <th className="px-3 py-4 font-semibold">Indicator</th>
                  <th className="px-3 py-4 text-right font-semibold">Value</th>
                  <th className="px-3 py-4 text-right font-semibold">Year</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 last:border-0"
                  >
                    <td className="px-3 py-5 text-gray-800">
                      {row.state || "—"}
                    </td>
                    <td className="px-3 py-5 text-gray-800">
                      {row.indicator || "—"}
                    </td>
                    <td className="px-3 py-5 text-right text-gray-800">
                      {row.value === "" ? "—" : String(row.value)}
                    </td>
                    <td className="px-3 py-5 text-right text-gray-800">
                      {row.year || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

        {/* Selected file */}
        <a
  href={fileUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-5 flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4 transition hover:border-[#1F7A3F] hover:bg-green-100"
  title="Click to open the uploaded file"
>
  <FileSpreadsheet className="h-9 w-9 shrink-0 text-[#1F7A3F]" />

  <div className="min-w-0">
    <p className="truncate text-sm font-semibold text-[#0B3C5D]">
      {file.name}
    </p>
    <p className="text-xs text-gray-500">
      {file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
    </p>
  </div>

  <span className="ml-auto shrink-0 text-xs font-semibold text-[#1F7A3F]">
    Click to view
  </span>
</a>

        

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            navigate("/admin-preview/upload/metadata", {
              state: { file },
            })
          }
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#1F7A3F] text-[#1F7A3F] transition hover:bg-green-50"
          aria-label="Back to metadata"
        >
          <ArrowLeft size={20} />
        </button>

        <button
          type="button"
          disabled={loading || !!error || rows.length === 0}
          onClick={() =>
            navigate("/admin-preview/upload/verification", {
              state: { file, metadata, previewRows: rows },
            })
          }
          className="flex items-center gap-2 rounded-full bg-[#1F7A3F] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#176332] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default AdminDatasetPreview;
