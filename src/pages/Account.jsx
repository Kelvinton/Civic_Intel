import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const savedItems = [
  {
    category: "STATES",
    title: "Lagos vs Ogun",
    indicator: "ANC 4+",
    years: "2021 - 2026",
    date: "Saved Sep 20, 2026",
  },
  {
    category: "STATES",
    title: "Lagos vs Kano",
    indicator: "WAEC Pass Rate",
    years: "2023 - 2025",
    date: "Saved Sep 10, 2026",
  },
  {
    category: "STATES",
    title: "Lagos vs Kano",
    indicator: "WAEC Pass Rate",
    years: "2023 - 2025",
    date: "Saved Sep 10, 2026",
  },
  {
    category: "STATES",
    title: "Lagos vs Imo",
    indicator: "Primary health centres",
    years: "2023 - 2026",
    date: "Saved Aug 20, 2026",
  },
];

const exportItems = [
  {
    type: "PNG",
    title: "Lagos vs Ogun",
    description: "ANC 4+ Coverage (national)",
    date: "Exported Sep 20, 2026",
  },
  {
    type: "PDF",
    title: "National Trend",
    description: "Primary Completion Rate",
    date: "Exported Sep 14, 2026",
  },
  {
    type: "PDF",
    title: "National Trend",
    description: "Primary Completion Rate",
    date: "Exported Sep 14, 2026",
  },
  {
    type: "CSV",
    title: "All states",
    description: "Health budget share",
    date: "Exported Sep 2, 2026",
  },
];

function SectionHeading({ children }) {
  return (
    <h2 className="flex items-center gap-2 text-2xl font-bold text-[#17191b] sm:text-3xl">
      <span className="h-3 w-3 shrink-0 rounded-full bg-[#218447]" />
      {children}
    </h2>
  );
}

function Account() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [savedFilter, setSavedFilter] = useState("All");
  const [exportFilter, setExportFilter] = useState("All");
  const [showAllSaved, setShowAllSaved] = useState(false);
  const [showAllExports, setShowAllExports] = useState(false);

  const [name, setName] = useState(
    user?.name ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      "Account holder"
  );
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");

  if (!isLoggedIn) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#e7edf0] px-5 py-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#0B3C5D]">
            Sign in to your account
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Please log in to view your account details and saved data.
          </p>
          <button
            type="button"
            onClick={() =>
              navigate("/login", { state: { from: "/profile" } })
            }
            className="mt-6 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-semibold text-white hover:bg-[#176331]"
          >
            Log In
          </button>
        </div>
      </main>
    );
  }

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  function handleSaveProfile(event) {
    event.preventDefault();
    setEditing(false);
    setNotice(
      "Your changes are displayed for this session. Connect a backend or update your AuthContext to persist profile changes."
    );
  }

  function handlePasswordChange(event) {
    event.preventDefault();

    if (newPassword.length < 8) {
      setNotice("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setNotice("Your new passwords do not match.");
      return;
    }

    setNotice(
      "The password form is ready, but password changes must be connected to your authentication provider."
    );
  }

  const filteredSaved =
    savedFilter === "All"
      ? savedItems
      : savedItems.filter((item) => item.category === savedFilter);

  const filteredExports =
    exportFilter === "All"
      ? exportItems
      : exportItems.filter((item) => item.type === exportFilter);

  const visibleSaved = showAllSaved
    ? filteredSaved
    : filteredSaved.slice(0, 4);

  const visibleExports = showAllExports
    ? filteredExports
    : filteredExports.slice(0, 4);

  return (
    <div className="bg-[#e7edf0] text-[#17191b]">
      {/* Account details */}
      <section className="px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading>Account</SectionHeading>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Log Out
            </button>
          </div>

          {notice && (
            <div
              role="status"
              className="mt-5 rounded-lg border border-[#1F7A3F]/20 bg-white p-4 text-sm leading-6 text-gray-700"
            >
              <div className="flex items-start justify-between gap-4">
                <p>{notice}</p>
                <button
                  type="button"
                  aria-label="Dismiss message"
                  onClick={() => setNotice("")}
                  className="font-semibold text-gray-500 hover:text-gray-900"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="mt-7">
            <div className="divide-y divide-[#aeb7bc]">
              <div className="flex min-h-16.5 flex-col justify-center gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <label htmlFor="account-name" className="text-sm text-[#73797d]">
                  Name
                </label>
                {editing ? (
                  <input
                    id="account-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:max-w-xs sm:text-right"
                  />
                ) : (
                  <span className="wrap-break-word text-sm">
                    {name || "Not provided"}
                  </span>
                )}
              </div>

              <div className="flex min-h-16.5 flex-col justify-center gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <label htmlFor="account-email" className="text-sm text-[#73797d]">
                  Email Address
                </label>
                {editing ? (
                  <input
                    id="account-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:max-w-xs sm:text-right"
                  />
                ) : (
                  <span className="break-all text-sm">
                    {email || "Not provided"}
                  </span>
                )}
              </div>

              <div className="flex min-h-16.5 flex-col justify-center gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-[#73797d]">Member since</span>
                <span className="text-sm">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : "Member"}
                </span>
              </div>

              <div className="flex min-h-16.5 flex-col justify-center gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-[#73797d]">Change Password</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm((value) => !value);
                    setNotice("");
                  }}
                  className="self-start text-sm font-medium hover:text-[#1F7A3F] sm:self-auto"
                >
                  {showPasswordForm ? "Cancel" : "••••••"}
                </button>
              </div>
            </div>

            {editing ? (
              <div className="mt-4 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setName(
                      user?.name ||
                        [user?.firstName, user?.lastName]
                          .filter(Boolean)
                          .join(" ") ||
                        "Account holder"
                    );
                    setEmail(user?.email || "");
                    setNotice("");
                  }}
                  className="rounded-full border border-gray-400 px-5 py-2 text-sm hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#1F7A3F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#176331]"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    setNotice("");
                  }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#1F7A3F] hover:underline"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14 5 5 5M4 20l4.5-1 10-10a2.12 2.12 0 0 0-3-3l-10 10L4 20Z"
                    />
                  </svg>
                  Edit
                </button>
              </div>
            )}
          </form>

          {showPasswordForm && (
            <form
              onSubmit={handlePasswordChange}
              className="mt-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6"
            >
              <h3 className="font-semibold text-[#0B3C5D]">
                Change your password
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-gray-600">
                  Current password
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required
                    autoComplete="current-password"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </label>
                <label className="text-sm text-gray-600">
                  New password
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </label>
                <label className="text-sm text-gray-600 sm:col-span-2">
                  Confirm new password
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </label>
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) => setShowPassword(event.target.checked)}
                />
                Show passwords
              </label>
              <button
                type="submit"
                className="mt-5 rounded-full bg-[#1F7A3F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#176331]"
              >
                Update Password
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Saved data */}
      <section className="bg-[#92aab8] px-5 py-8 sm:px-8 sm:py-9 lg:px-14">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading>Saved data</SectionHeading>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <span className="sr-only">Filter saved data</span>
                <select
                  value={savedFilter}
                  onChange={(event) => setSavedFilter(event.target.value)}
                  className="max-w-24 rounded-md  px-2 py-1 outline-none"
                >
                  <option value="All">Filter</option>
                  <option value="STATES">States</option>
                </select>
                <span aria-hidden="true">☰</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAllSaved((value) => !value)}
                className="font-medium text-[#1F7A3F] hover:underline"
              >
                {showAllSaved ? "Show less" : "See all"}
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {visibleSaved.map((item, index) => (
              <article
                key={`${item.title}-${item.indicator}-${index}`}
                className="flex min-h-37 flex-col rounded-lg border-l-4 border-[#0B3C5D] bg-white p-4 shadow-sm"
              >
                <p className="text-[11px] font-medium text-[#1F7A3F]">
                  {item.category}
                </p>
                <h3 className="mt-1 text-base font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-700">{item.indicator}</p>
                <p className="mt-1 text-xs text-gray-500">{item.years}</p>
                <div className="mt-3 border-t border-gray-100 pt-3 text-[10px] text-[#1F7A3F]">
                  <span aria-hidden="true">✓ </span>
                  {item.date}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Recent exports */}
      <section className="px-5 py-10 sm:px-8 sm:py-12 lg:px-14">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading>Recent Exports</SectionHeading>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <span className="sr-only">Filter recent exports</span>
                <select
                  value={exportFilter}
                  onChange={(event) => setExportFilter(event.target.value)}
                  className="max-w-24   px-2 py-1 outline-none"
                >
                  <option value="All">Filter</option>
                  <option value="PNG">PNG</option>
                  <option value="PDF">PDF</option>
                  <option value="CSV">CSV</option>
                </select>
                <span aria-hidden="true">☰</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAllExports((value) => !value)}
                className="font-medium text-[#1F7A3F] hover:underline"
              >
                {showAllExports ? "Show less" : "See all"}
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {visibleExports.map((item, index) => (
              <article
                key={`${item.title}-${item.type}-${index}`}
                className="flex min-h-37 flex-col rounded-lg bg-white p-4 shadow-sm"
              >
                <span className="w-fit rounded-full bg-[#e8f2ec] px-3 py-1 text-[10px] font-medium text-[#1F7A3F]">
                  {item.type}
                </span>
                <h3 className="mt-2 text-base font-bold">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  {item.description}
                </p>
                <div className="mt-auto border-t border-dashed border-gray-200 pt-4 text-[11px] text-gray-500">
                  {item.date}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      
    </div>
  );
}

export default Account;