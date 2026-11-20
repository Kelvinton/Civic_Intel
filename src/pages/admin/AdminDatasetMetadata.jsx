
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileSpreadsheet } from "lucide-react";

function AdminDatasetMetadata() {
  const location = useLocation();
  const navigate = useNavigate();

  const file = location.state?.file;

  const [formData, setFormData] = useState({
    title: "",
    publisher: "",
    dataset_name: "",
    vintage: "",
    geography: "",
    license: "",
    last_verified: "",
    verified_by: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    navigate("/admin-preview/upload/preview", {
      state: {
        file,
        metadata: formData,
      },
    });
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-300 bg-[#F1F4F6] px-4 py-3 text-sm text-[#0B3C5D] outline-none transition focus:border-[#1F7A3F] focus:ring-2 focus:ring-green-100";

  const labelClass = "text-sm font-semibold text-[#0B3C5D]";

  if (!file) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-[#0B3C5D]">
          No dataset selected
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Please select a dataset file before continuing.
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
                      index <= 1
                        ? "bg-[#1F7A3F] text-white"
                        : "bg-[#E7ECEF] text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      index <= 1
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

      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B3C5D]">
          Dataset Metadata
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Provide the details needed to identify and document this dataset.
        </p>
      </div>

      {/* Metadata form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
      >
        {/* Selected file */}
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
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
            File selected
          </span>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
          {/* Dataset title */}
          <div>
            <label className={labelClass}>
              Dataset title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              minLength={3}
              maxLength={200}
              required
              placeholder="e.g. Nigeria Demographic and Health Survey 2023"
              className={inputClass}
            />
          </div>

          {/* Publisher */}
          <div>
            <label className={labelClass}>
              Publisher <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              minLength={2}
              maxLength={150}
              required
              placeholder="e.g. National Population Commission / ICF"
              className={inputClass}
            />
          </div>

          {/* Dataset name */}
          <div>
            <label className={labelClass}>
              Dataset name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="dataset_name"
              value={formData.dataset_name}
              onChange={handleChange}
              minLength={2}
              maxLength={200}
              required
              placeholder="e.g. ndhs_2023_state_health"
              className={inputClass}
            />
          </div>

          {/* Vintage */}
          <div>
            <label className={labelClass}>
              Vintage (year) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vintage"
              value={formData.vintage}
              onChange={handleChange}
              maxLength={50}
              required
              placeholder="e.g. 2023"
              className={inputClass}
            />
          </div>

          {/* Geography */}
          <div>
            <label className={labelClass}>
              Geography <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="geography"
              value={formData.geography}
              onChange={handleChange}
              minLength={2}
              maxLength={150}
              required
              placeholder="e.g. State-level"
              className={inputClass}
            />
          </div>

          {/* License */}
          <div>
            <label className={labelClass}>
              License <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="license"
              value={formData.license}
              onChange={handleChange}
              minLength={2}
              maxLength={150}
              required
              placeholder="e.g. Public / Open"
              className={inputClass}
            />
          </div>

          {/* Last verified */}
          <div>
            <label className={labelClass}>
              Last verified date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="last_verified"
              value={formData.last_verified}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          {/* Verified by */}
          <div>
            <label className={labelClass}>
              Verified by
            </label>
            <input
              type="text"
              name="verified_by"
              value={formData.verified_by}
              onChange={handleChange}
              maxLength={100}
              placeholder="e.g. ngoziade"
              className={inputClass}
            />
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              navigate("/admin-preview/upload", {
                state: { file },
              })
            }
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#1F7A3F] text-[#1F7A3F] transition hover:bg-green-50"
            aria-label="Back to upload"
          >
            <ArrowLeft size={20} />
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-full bg-[#1F7A3F] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#176332]"
          >
            Continue
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminDatasetMetadata;
