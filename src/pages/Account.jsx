
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../api/api.js";

// Get the logged-in user's name from the available user fields.
function getUserName(user) {
  if (!user) return "";

  const fullName = user.name?.trim();

  if (fullName) return fullName;

  const firstName = user.firstName || user.first_name || "";
  const lastName = user.lastName || user.last_name || "";

  return `${firstName} ${lastName}`.trim();
}

// Read the signup date from common backend field names.
function getSignupDate(user) {
  const date =
    user?.createdAt ||
    user?.created_at ||
    user?.dateJoined ||
    user?.date_joined;

  if (!date) return null;

  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

// Format dates received from the backend.
function formatDisplayDate(date, prefix = "") {
  if (!date) return `${prefix}Date unavailable`;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return `${prefix}Date unavailable`;
  }

  return `${prefix}${parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

// Display years from saved comparisons and export records.
function formatYearDisplay(item) {
  if (item.year != null) {
    return item.year;
  }

  if (Array.isArray(item.years) && item.years.length > 0) {
    return [...new Set(item.years)]
      .sort((a, b) => Number(a) - Number(b))
      .join(", ");
  }

  if (item.year_from != null || item.year_to != null) {
    if (
      item.year_from != null &&
      item.year_from === item.year_to
    ) {
      return item.year_from;
    }

    return `${item.year_from ?? "—"} - ${item.year_to ?? "—"}`;
  }

  return "—";
}

// Normalize paginated API responses.
// Supports:
// { items: [] }
// { data: { items: [] } }
// { data: { data: { items: [] } } }
function normalizeListResponse(response) {
  const payload =
    response?.data?.data ??
    response?.data ??
    response;

  // Also support an API response that is directly an array.
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : [];

  const total = Number(payload?.total ?? items.length);

  return {
    items,
    total: Number.isFinite(total) ? total : items.length,
  };
}

function SectionHeading({ children }) {
  return (
    <h2 className="flex items-center gap-2 text-2xl font-bold text-[#17191b] sm:text-3xl">
      <span
        aria-hidden="true"
        className="relative h-2.5 w-2.5 shrink-0 rounded-full bg-[#1F7A3F] shadow-[0_0_8px_rgba(31,122,63,0.9)] animate-pulse"
      />
      {children}
    </h2>
  );
}

function Account() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Account interface state
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Filters and See all controls
  const [savedFilter, setSavedFilter] = useState("All");
  const [exportFilter, setExportFilter] = useState("All");
  const [showAllSaved, setShowAllSaved] = useState(false);
  const [showAllExports, setShowAllExports] = useState(false);

  // Saved comparisons from the backend
  const [savedItems, setSavedItems] = useState([]);
  const [savedTotal, setSavedTotal] = useState(0);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [savedError, setSavedError] = useState("");
  const [deletingSavedId, setDeletingSavedId] = useState(null);
  // Custom delete confirmation popup
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Export history from the backend
  const [exportItems, setExportItems] = useState([]);
  const [exportTotal, setExportTotal] = useState(0);
  const [loadingExports, setLoadingExports] = useState(true);
  const [exportError, setExportError] = useState("");
  const [deletingExportId, setDeletingExportId] = useState(null);

  // Profile fields
  const [name, setName] = useState(() => getUserName(user));
  const [email, setEmail] = useState(() => user?.email || "");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback messages
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("info");

  // Fetch saved comparisons and export history.
  useEffect(() => {
    // No request is needed when the user is logged out.
    // The login screen is displayed instead.
    if (!isLoggedIn) return;

    let active = true;

    async function loadAccountData() {
      // Start loading whenever the user logs in.
      setLoadingSaved(true);
      setLoadingExports(true);

      setSavedError("");
      setExportError("");

      // Fetch both resources independently.
      const [savedResult, exportResult] =
        await Promise.allSettled([
          apiRequest("/saved-comparisons"),
          apiRequest("/exports"),
        ]);

      // Prevent updates if the component has unmounted
      // or the user has logged out.
      if (!active) return;

      // Process saved comparisons.
      if (savedResult.status === "fulfilled") {
        const result = normalizeListResponse(
          savedResult.value
        );

        setSavedItems(result.items);
        setSavedTotal(result.total);
        setSavedError("");
      } else {
        setSavedItems([]);
        setSavedTotal(0);

        setSavedError(
          savedResult.reason?.message ||
            "Unable to load your saved comparisons."
        );
      }

      // Process export history.
      if (exportResult.status === "fulfilled") {
        const result = normalizeListResponse(
          exportResult.value
        );

        setExportItems(result.items);
        setExportTotal(result.total);
        setExportError("");
      } else {
        setExportItems([]);
        setExportTotal(0);

        setExportError(
          exportResult.reason?.message ||
            "Unable to load your export history."
        );
      }

      setLoadingSaved(false);
      setLoadingExports(false);
    }

    loadAccountData();

    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  // Display feedback messages.
  function showNotice(message, type = "info") {
    setNotice(message);
    setNoticeType(type);
  }

  // Log out.
  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate("/", { replace: true });
    }
  }

  // Delete a saved comparison.
  async function handleDeleteSaved(savedId) {
    if (savedId == null || deletingSavedId !== null) return;

    try {
      setDeletingSavedId(savedId);

      await apiRequest(
        `/saved-comparisons/${encodeURIComponent(savedId)}`,
        {
          method: "DELETE",
        }
      );

      // Update the interface after successful deletion.
      setSavedItems((previousItems) =>
        previousItems.filter(
          (item) => String(item.id) !== String(savedId)
        )
      );

      setSavedTotal((previousTotal) =>
        Math.max(0, previousTotal - 1)
      );

      showNotice(
        "Saved comparison deleted successfully.",
        "success"
      );
    } catch (error) {
      showNotice(
        error?.message ||
          "Unable to delete this saved comparison.",
        "error"
      );
    } finally {
      setDeletingSavedId(null);
    }
  }

  // Delete an export from the history.
  async function handleDeleteExport(exportId) {
    if (exportId == null || deletingExportId !== null) return;

    try {
      setDeletingExportId(exportId);

      await apiRequest(
        `/exports/${encodeURIComponent(exportId)}`,
        {
          method: "DELETE",
        }
      );

      setExportItems((previousItems) =>
        previousItems.filter(
          (item) => String(item.id) !== String(exportId)
        )
      );

      setExportTotal((previousTotal) =>
        Math.max(0, previousTotal - 1)
      );

      showNotice("Export record deleted successfully.", "success");
    } catch (error) {
      showNotice(
        error?.message || "Unable to delete this export record.",
        "error"
      );
    } finally {
      setDeletingExportId(null);
    }
  }

  // Save profile changes locally.
  // A permanent backend profile update still requires its endpoint.
  function handleSaveProfile(event) {
    event.preventDefault();

    setEditing(false);

    showNotice(
      "Your profile changes are displayed for this session. Permanent profile updates are not yet connected to the backend.",
      "info"
    );
  }

  // Change password.
  async function handlePasswordChange(event) {
    event.preventDefault();

    setNotice("");

    if (changingPassword) return;

    if (newPassword.length < 8) {
      showNotice(
        "Your new password must contain at least 8 characters.",
        "error"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotice(
        "Your new passwords do not match.",
        "error"
      );
      return;
    }

    if (currentPassword === newPassword) {
      showNotice(
        "Your new password must be different from your current password.",
        "error"
      );
      return;
    }

    try {
      setChangingPassword(true);

      await apiRequest("/users/me/password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowPasswordForm(false);

      showNotice(
        "Your password has been changed successfully.",
        "success"
      );
    } catch (error) {
      showNotice(
        error?.message ||
          "Unable to change your password. Check your current password and try again.",
        "error"
      );
    } finally {
      setChangingPassword(false);
    }
  }

  // Profile signup date.
  const signupDate = getSignupDate(user);

  // Filter saved comparisons by indicator sector.
  const filteredSaved =
    savedFilter === "All"
      ? savedItems
      : savedItems.filter(
          (item) =>
            item.indicator?.sector?.toLowerCase() ===
            savedFilter.toLowerCase()
        );

  // Filter exports by format.
  const filteredExports =
    exportFilter === "All"
      ? exportItems
      : exportItems.filter(
          (item) =>
            item.format?.toUpperCase() === exportFilter
        );

  // Show four records initially.
  const visibleSaved = showAllSaved
    ? filteredSaved
    : filteredSaved.slice(0, 4);

  const visibleExports = showAllExports
    ? filteredExports
    : filteredExports.slice(0, 4);

  // Get unique sectors for the saved data filter.
  const savedSectors = [
    ...new Set(
      savedItems
        .map((item) => item.indicator?.sector)
        .filter(Boolean)
    ),
  ];

  // Require login.
  if (!isLoggedIn) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#e7edf0] px-5 py-16 mt-8">
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
              navigate("/login", {
                state: { from: "/profile" },
              })
            }
            className="mt-6 rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-semibold text-white hover:bg-[#176331]"
          >
            Log In
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="bg-[#e7edf0] text-[#17191b]">

      {/* ACCOUNT DETAILS */}
      <section className="px-5 py-10 pt-24 sm:px-8 sm:py-14 sm:pt-28 lg:px-14">
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

          {/* FEEDBACK MESSAGES */}
          {notice && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-5 rounded-lg border bg-white p-4 text-sm leading-6 ${
                noticeType === "success"
                  ? "border-green-200 text-green-800"
                  : noticeType === "error"
                    ? "border-red-200 text-red-700"
                    : "border-[#1F7A3F]/20 text-gray-700"
              }`}
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

          {/* PROFILE DETAILS */}
          <form onSubmit={handleSaveProfile} className="mt-7">
            <div className="divide-y divide-[#aeb7bc]">

              {/* NAME */}
              <div className="flex min-h-16.5 flex-col justify-center gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor="account-name"
                  className="text-sm text-[#73797d]"
                >
                  Name
                </label>

                {editing ? (
                  <input
                    id="account-name"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    required
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:max-w-xs sm:text-right"
                  />
                ) : (
                  <span className="wrap-break-word text-sm">
                    {getUserName(user) || name || "Name unavailable"}
                  </span>
                )}
              </div>

              {/* EMAIL */}
              <div className="flex min-h-16.5 flex-col justify-center gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor="account-email"
                  className="text-sm text-[#73797d]"
                >
                  Email Address
                </label>

                {editing ? (
                  <input
                    id="account-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm sm:max-w-xs sm:text-right"
                  />
                ) : (
                  <span className="break-all text-sm">
                    {user?.email || email || "Email unavailable"}
                  </span>
                )}
              </div>

              {/* MEMBER SINCE */}
              <div className="flex min-h-16.5 flex-col justify-center gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-[#73797d]">
                  Member since
                </span>

                <span className="text-sm">
                  {signupDate
                    ? signupDate.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Signup date unavailable"}
                </span>
              </div>

              {/* CHANGE PASSWORD */}
              <div className="flex min-h-16.5 flex-col justify-center gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-[#73797d]">
                  Change Password
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm((value) => !value);
                    setNotice("");
                    setShowPassword(false);
                  }}
                  className="self-start text-sm font-medium hover:text-[#1F7A3F] sm:self-auto"
                >
                  {showPasswordForm ? "Cancel" : "••••••"}
                </button>
              </div>
            </div>

            {/* PROFILE ACTIONS */}
            {editing ? (
              <div className="mt-4 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setName(getUserName(user));
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
                    setName(getUserName(user));
                    setEmail(user?.email || "");
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

          {/* CHANGE PASSWORD FORM */}
          {showPasswordForm && (
            <form
              onSubmit={handlePasswordChange}
              className="mt-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6"
            >
              <h3 className="font-semibold text-[#0B3C5D]">
                Change your password
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Enter your current password and choose a new password with at
                least 8 characters.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-gray-600">
                  Current password

                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    required
                    autoComplete="current-password"
                    disabled={changingPassword}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#1F7A3F] focus:ring-1 focus:ring-[#1F7A3F] disabled:bg-gray-100"
                  />
                </label>

                <label className="text-sm text-gray-600">
                  New password

                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    required
                    minLength={8}
                    autoComplete="new-password"
                    disabled={changingPassword}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#1F7A3F] focus:ring-1 focus:ring-[#1F7A3F] disabled:bg-gray-100"
                  />
                </label>

                <label className="text-sm text-gray-600 sm:col-span-2">
                  Confirm new password

                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    required
                    minLength={8}
                    autoComplete="new-password"
                    disabled={changingPassword}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#1F7A3F] focus:ring-1 focus:ring-[#1F7A3F] disabled:bg-gray-100"
                  />
                </label>
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) =>
                    setShowPassword(event.target.checked)
                  }
                  disabled={changingPassword}
                  className="h-4 w-4 accent-[#1F7A3F]"
                />

                Show passwords
              </label>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-full bg-[#1F7A3F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#176331] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword
                    ? "Updating Password..."
                    : "Update Password"}
                </button>

                <button
                  type="button"
                  disabled={changingPassword}
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowPassword(false);
                    setNotice("");
                  }}
                  className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* SAVED DATA */}
      <section className="bg-[#92aab8] px-5 py-8 sm:px-8 sm:py-9 lg:px-14">
        <div className="mx-auto max-w-5xl">

          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading>
              Saved data ({savedTotal})
            </SectionHeading>

            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <span className="sr-only">
                  Filter saved data
                </span>

                <select
                  value={savedFilter}
                  onChange={(event) =>
                    setSavedFilter(event.target.value)
                  }
                  className="max-w-32 rounded-md px-2 py-1 outline-none"
                >
                  <option value="All">All sectors</option>

                  {savedSectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>

                
              </label>

              {filteredSaved.length > 4 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowAllSaved((value) => !value)
                  }
                  className="font-medium text-[#1F7A3F] hover:underline"
                >
                  {showAllSaved ? "Show less" : "See all"}
                </button>
              )}
            </div>
          </div>

          {/* SAVED COMPARISON CARDS */}
          <div className="mt-8">
            {loadingSaved ? (
              <p className="py-8 text-center text-sm text-gray-700">
                Loading your saved comparisons...
              </p>
            ) : savedError ? (
              <p className="rounded-lg bg-white p-5 text-sm text-red-600">
                {savedError}
              </p>
            ) : visibleSaved.length === 0 ? (
              <p className="rounded-lg bg-white p-6 text-center text-sm text-gray-500">
                {savedItems.length === 0
                  ? "You haven't saved any comparisons yet."
                  : "No saved comparisons match this filter."}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                {visibleSaved.map((item) => (
                  <article
                    key={item.id}
                    className="flex min-h-40 flex-col rounded-lg border-l-4 border-[#0B3C5D] bg-white p-4 shadow-sm"
                  >
                    <p className="text-[11px] font-medium uppercase text-[#1F7A3F]">
                      {item.indicator?.sector || "Comparison"}
                    </p>

                    <h3 className="mt-1 text-base font-bold">
                      {item.title || "Untitled comparison"}
                    </h3>

                    <p className="mt-1 text-sm text-gray-700">
                      {item.indicator?.name || "Indicator unavailable"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {Array.isArray(item.states) &&
                      item.states.length > 0
                        ? item.states.join(", ")
                        : "States unavailable"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {formatYearDisplay(item)}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                      <span className="text-[10px] text-[#1F7A3F]">
                        {formatDisplayDate(
                          item.saved_at,
                          "Saved "
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirmation({
                            type: "saved",
                            id: item.id,
                            title: item.title || "this saved comparison",
                          })
                        }
                        disabled={
                          deletingSavedId !== null
                        }
                        className="text-xs font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {String(deletingSavedId) === String(item.id)
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RECENT EXPORTS */}
      <section className="px-5 py-10 sm:px-8 sm:py-12 lg:px-14">
        <div className="mx-auto max-w-5xl">

          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading>
              Recent Exports ({exportTotal})
            </SectionHeading>

            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <span className="sr-only">
                  Filter recent exports
                </span>

                <select
                  value={exportFilter}
                  onChange={(event) =>
                    setExportFilter(event.target.value)
                  }
                  className="max-w-24 px-2 py-1 outline-none"
                >
                  <option value="All">All formats</option>
                  <option value="XLSX">XLSX</option>
                  <option value="PDF">PDF</option>
                  <option value="CSV">CSV</option>
                  
                </select>

                
              </label>

              {filteredExports.length > 4 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowAllExports((value) => !value)
                  }
                  className="font-medium text-[#1F7A3F] hover:underline"
                >
                  {showAllExports ? "Show less" : "See all"}
                </button>
              )}
            </div>
          </div>

          {/* EXPORT HISTORY CARDS */}
          <div className="mt-8">
            {loadingExports ? (
              <p className="py-8 text-center text-sm text-gray-500">
                Loading your export history...
              </p>
            ) : exportError ? (
              <p className="rounded-lg bg-white p-5 text-sm text-red-600">
                {exportError}
              </p>
            ) : visibleExports.length === 0 ? (
              <p className="rounded-lg bg-white p-6 text-center text-sm text-gray-500">
                {exportItems.length === 0
                  ? "You haven't exported any data yet."
                  : "No exports match this filter."}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                {visibleExports.map((item) => (
                  <article
                    key={item.id}
                    className="flex min-h-37 flex-col rounded-lg bg-white p-4 shadow-sm"
                  >
                    <span className="w-fit rounded-full bg-[#e8f2ec] px-3 py-1 text-[10px] font-medium uppercase text-[#1F7A3F]">
                      {item.format || "Unknown"}
                    </span>

                    <h3 className="mt-2 text-base font-bold">
                      {item.title ||
                        item.dataset?.title ||
                        "Untitled export"}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      {item.subtitle ||
                        item.indicator?.name ||
                        "No description"}
                    </p>

                    {Array.isArray(item.states) &&
                      item.states.length > 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                          {item.states.join(", ")}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-gray-500">
                        {formatYearDisplay(item)}
                      </p>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-gray-200 pt-4">
                      <span className="text-[11px] text-gray-500">
                        {formatDisplayDate(item.exported_at, "Exported ")}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirmation({
                            type: "export",
                            id: item.id,
                            title: item.title || item.dataset?.title || "this export",
                          })
                        }
                        disabled={deletingExportId !== null}
                        className="text-xs font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {String(deletingExportId) === String(item.id)
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {deleteConfirmation && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4"
          role="presentation"
          onClick={() => setDeleteConfirmation(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
              <span className="text-xl">!</span>
            </div>

            <h2
              id="delete-dialog-title"
              className="mt-4 text-lg font-bold text-gray-900"
            >
              Delete this{" "}
              {deleteConfirmation.type === "saved"
                ? "comparison"
                : "export"}?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {deleteConfirmation.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  deletingSavedId !== null ||
                  deletingExportId !== null
                }
                onClick={async () => {
                  const confirmation = deleteConfirmation;
                  if (!confirmation) return;

                  setDeleteConfirmation(null);

                  if (confirmation.type === "saved") {
                    await handleDeleteSaved(confirmation.id);
                  } else {
                    await handleDeleteExport(confirmation.id);
                  }
                }}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Account;
