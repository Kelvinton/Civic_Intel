
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileSpreadsheet, X, ArrowRight } from "lucide-react";

function AdminDatasetUpload() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [message, setMessage] = useState("");

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    const validateFile = (file) => {
        setError("");
        setMessage("");

        if (!file) return;

        const allowedExtensions = [".csv", ".xlsx", ".xls"];
        const extension = file.name
        .slice(file.name.lastIndexOf("."))
        .toLowerCase();

        if (!allowedExtensions.includes(extension)) {
        setError("Please select a CSV, XLSX or XLS file.");
        setSelectedFile(null);
        return;
        }

        if (file.size > MAX_FILE_SIZE) {
        setError("File size must not exceed 10 MB.");
        setSelectedFile(null);
        return;
        }

        setSelectedFile(file);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files[0];
        validateFile(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        setError("");
        setMessage("");

        if (fileInputRef.current) {
        fileInputRef.current.value = "";
        }
    };

    const formatFileSize = (size) => {
        return size < 1024 * 1024
        ? `${(size / 1024).toFixed(1)} KB`
        : `${(size / (1024 * 1024)).toFixed(2)} MB`;
    };

    const handleContinue = () => {
        if (!selectedFile) return;

        navigate("/admin-preview/upload/metadata", {
            state: { file: selectedFile },
        });
    };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B3C5D]">
          Add New Dataset
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Upload and prepare a dataset for CivicIntel.
        </p>
      </div>

      {/* Workflow steps */}
      <div className="mb-8 overflow-x-auto rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex min-w-[650px] items-center justify-between">
          {["Upload", "Metadata", "Preview", "Verification", "Q/A", "Publish"].map(
            (step, index) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                      index === 0
                        ? "bg-[#1F7A3F] text-white"
                        : "bg-[#E7ECEF] text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <span
                    className={`text-xs font-medium ${
                      index === 0 ? "text-[#1F7A3F]" : "text-gray-400"
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

      {/* Upload card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#0B3C5D]">
            Upload Dataset File
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Upload your dataset in CSV or Excel format. The original raw file
            will be preserved and never overwritten.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(event) => validateFile(event.target.files[0])}
        />

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
            isDragging
              ? "border-[#1F7A3F] bg-green-50"
              : "border-gray-300 bg-[#F8FAFC] hover:border-[#1F7A3F]"
          }`}
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E7ECEF]">
            <Upload className="h-7 w-7 text-[#0B3C5D]" />
          </div>

          <p className="text-sm font-semibold text-[#0B3C5D]">
            Drop your file here or click to browse
          </p>

          <p className="mt-2 text-xs text-gray-500">
            CSV, XLSX or XLS · Maximum file size: 10 MB
          </p>
        </div>

        {selectedFile && (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 shrink-0 text-[#1F7A3F]" />

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#0B3C5D]">
                  {selectedFile.name}
                </p>

                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeFile}
              className="rounded-full p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Remove selected file"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-[#1F7A3F] transition hover:bg-gray-50"
            aria-label="Go back"
          >
            ←
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedFile}
            className="flex items-center gap-2 rounded-full bg-[#1F7A3F] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#176332] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDatasetUpload;
