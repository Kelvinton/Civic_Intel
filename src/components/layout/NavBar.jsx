
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { NavLink, Link, useLocation} from "react-router-dom";


import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../api/api.js";
import civicIntelLogo from "../../assets/signup.logo.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Health", to: "/health" },
  { label: "Education", to: "/education" },
  { label: "States", to: "/states" },
  { label: "Explore", to: "/explore" },
  { label: "Sources and Methods", to: "/sources-and-methods" },
];

const governanceLinks = [
  {
    label: "Sentiment Analysis",
    to: "/sentiment-analysis",
    description: "Explore public sentiment",
  },
  {
    label: "Voter Education",
    to: "/voter-education",
    description: "Learn about voting and elections",
  },
  {
    label: "FAQ",
    to: "/faq",
    description: "Find answers to common questions",
  },
];

function Navbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();        

  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [governanceOpen, setGovernanceOpen] = useState(false);
  const [mobileGovernanceOpen, setMobileGovernanceOpen] = useState(false);
  // Notification data
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  const linkClass = ({ isActive }) =>
    `whitespace-nowrap text-sm transition-colors duration-200 ${
      isActive
        ? "font-semibold text-[#1F7A3F]"
        : "text-white hover:text-[#1F7A3F]"
  }`;

  function handleLogout() {
    logout();
    setProfileOpen(false);
    setMenuOpen(false);
  }

  function closeMobileMenu() {
    setMenuOpen(false);
    setMobileGovernanceOpen(false);
  }

  async function fetchNotifications() {
    setNotificationsLoading(true);
    setNotificationError("");

    try {
      const data = await apiRequest(
        "/notifications?limit=20&offset=0"
    );

    setNotificationError("");

      setNotifications(
        Array.isArray(data?.items) ? data.items : []
      );

      setUnreadCount(
        Number(data?.unread_count) || 0
      );
    } catch (error) {
      setNotificationError(
        error.message || "Unable to load notifications."
      );
    } finally {
      setNotificationsLoading(false);
    }
  }

  async function markNotificationAsRead(notificationId) {
    try {
      await apiRequest(
        `/notifications/${notificationId}/read`,
        {
          method: "POST",
        }
      );

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount((previousCount) =>
        Math.max(0, previousCount - 1)
      );
    } catch (error) {
      setNotificationError(
        error.message || "Unable to mark notification as read."
      );
    }
  }

  async function markAllNotificationsAsRead() {
    try {
      await apiRequest("/notifications/read-all", {
        method: "POST",
      });

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      setNotificationError(
        error.message || "Unable to mark notifications as read."
      );
    }
  }

  useEffect(() => {
    if (!isLoggedIn) return;

    const timeoutId = setTimeout(() => {
      fetchNotifications();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [isLoggedIn]);

  return (
    <motion.header
      key={location.pathname}
      initial={
        shouldReduceMotion
          ? false
          : { y: -80, opacity: 0 }
      }
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="fixed top-0 z-50 w-full bg-[#0B3C5D] text-white shadow-md">
      <div className="mx-auto flex min-h-19 max-w-360 items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-14">
        {/* Logo */}
        <Link
          to="/"
          aria-label="CivicIntel home"
          className="flex shrink-0 items-center"
        >
          <img
            src={civicIntelLogo}
            alt="CivicIntel"
            className="h-14 w-auto max-w-13.5 rounded-md  object-contain"
          />
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden flex-1 items-center justify-center lg:flex"
        >
          <ul className="flex items-center gap-5 xl:gap-8">
            {navLinks.slice(0, 3).map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  className={linkClass}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}

            <li
              className="relative"
              onMouseEnter={() => setGovernanceOpen(true)}
              onMouseLeave={() => setGovernanceOpen(false)}
            >
              <button
                type="button"
                onClick={() =>
                  setGovernanceOpen((open) => !open)
                }
                aria-haspopup="true"
                aria-expanded={governanceOpen}
                className={`inline-flex items-center gap-1 whitespace-nowrap text-sm transition-colors duration-200 ${
                  governanceOpen
                    ? "font-semibold text-[#1F7A3F]"
                    : "text-white hover:text-[#1F7A3F]"
                }`}
              >
                Governance

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className={`h-4 w-4 transition-transform duration-200 ${
                    governanceOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 9 6 6 6-6"
                  />
                </svg>
              </button>

              {governanceOpen && (
                <div className="absolute left-0 top-full z-50 w-64 pt-3">
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white py-2 text-[#20272B] shadow-xl">
                    {governanceLinks.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        className="block px-4 py-3 transition-colors duration-200 hover:bg-gray-100 hover:text-[#1F7A3F]"
                      >
                        <span className="block text-sm font-semibold">
                          {item.label}
                        
                        </span>

                        <span className="mt-1 block text-xs text-gray-500">
                          {item.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>

            {navLinks.slice(3).map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  className={linkClass}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop authentication controls */}
        {isLoggedIn ? (
          <div className="hidden shrink-0 items-center gap-6 lg:flex">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  setProfileOpen(false);
                }}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                className="relative rounded-full p-2 transition hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"
                  />
                </svg>

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white text-sm text-gray-700 shadow-xl sm:w-96">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <div>
                      <p className="font-semibold text-[#0B3C5D]">
                        Notifications
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {unreadCount} unread messages
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsAsRead}
                          className="whitespace-nowrap text-xs font-medium text-[#1F7A3F] hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={fetchNotifications}
                        disabled={notificationsLoading}
                        className="text-xs font-medium text-[#0B3C5D] hover:underline disabled:opacity-50 cursor-pointer"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  {/* Notification list */}
                  <div className="max-h-96 overflow-y-auto">
                    {notificationsLoading ? (
                      <p className="p-6 text-center text-gray-500">
                        Loading notifications...
                      </p>
                    ) : notificationError ? (
                      <div className="p-5 text-center">
                        <p className="text-sm text-red-600">
                          {notificationError}
                        </p>

                        <button
                          type="button"
                          onClick={fetchNotifications}
                          className="mt-3 text-xs font-semibold text-[#1F7A3F] hover:underline"
                        >
                          Try again
                        </button>
                      </div>
                    ) : notifications.length === 0 ? (
                      <p className="p-6 text-center text-gray-500">
                        You’re all caught up.
                      </p>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => {
                            if (!notification.read) {
                              markNotificationAsRead(notification.id);
                            }
                          }}
                          className={`border-b border-gray-100 px-4 py-3 last:border-b-0 ${
                            notification.read ? "bg-white" : "bg-blue-50/60"
                          } ${
                            notification.link ? "cursor-pointer hover:bg-gray-50" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                notification.read
                                  ? "bg-gray-300"
                                  : "bg-[#1F7A3F]"
                              }`}
                            />

                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-[#0B3C5D]">
                                {notification.title}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-gray-600">
                                {notification.body}
                              </p>

                              {!notification.read && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    markNotificationAsRead(notification.id);
                                  }}
                                  className="mt-2 text-xs font-semibold text-[#1F7A3F] "
                                >
                                  Mark as read
                                </button>
                              )}

                              <p className="mt-2 text-[11px] text-gray-400">
                                {new Date(
                                  notification.created_at
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((open) => !open);
                  setNotificationsOpen(false);
                }}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-4 border-[#1F7A3F] bg-white transition hover:scale-105"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Your profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0B3C5D"
                    strokeWidth="1.5"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                    />
                  </svg>
                )}
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-16 z-50 w-56 rounded-xl bg-white p-3 text-gray-800 shadow-xl">
                  <div className="border-b border-gray-100 px-3 py-2">
                    <p className="font-semibold text-[#0B3C5D]">
                      {user?.firstName || user?.name || "My Account"}
                    </p>

                    {user?.email && (
                      <p className="mt-1 break-all text-xs text-gray-500">
                        {user.email}
                      </p>
                    )}
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="mt-2 block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    My Account
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/signup"
              className="inline-flex items-center rounded-full bg-[#1F7A3F] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#176331]"
            >
              Sign Up
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white p-1 text-[#0B3C5D] shadow-md shadow-black/20 ml-5"
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.span>
            </Link>

            <Link
              to="/login"
              className="rounded-full border border-white/50 px-8 py-3 text-sm transition hover:bg-white/10"
            >
              Log In
            </Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            className="rounded-lg border border-white/30 p-2 hover:bg-white/10"
          >
            {menuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 6 12 12M18 6 6 18"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Full-width mobile navigation */}
        {menuOpen && (
          <div
            className="
              fixed left-0 right-0 top-19 z-50
              max-h-[calc(100dvh-76px)] overflow-y-auto
              w-screen bg-[#0B3C5D] px-5 py-5
              shadow-xl sm:px-8
              lg:hidden
            "
          >
            <nav aria-label="Mobile navigation">
              <ul className="flex flex-col items-center gap-2">
                {navLinks.slice(0, 3).map((link) => (
                  <li key={link.to} className="w-full">
                    <NavLink
                      to={link.to}
                      end={link.to === "/"}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `block w-full rounded-lg px-3 py-3 text-center text-sm ${
                          isActive
                            ? "font-semibold text-[#1F7A3F]"
                            : "text-white hover:text-[#1F7A3F]"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}

                <li className="w-full">
                  <button
                    type="button"
                    onClick={() =>
                      setMobileGovernanceOpen((open) => !open)
                    }
                    aria-expanded={mobileGovernanceOpen}
                    aria-haspopup="true"
                    className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-center text-sm text-white transition hover:text-[#1F7A3F]"
                  >
                    Governance

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className={`h-4 w-4 transition-transform duration-200 ${
                        mobileGovernanceOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m6 9 6 6 6-6"
                      />
                    </svg>
                  </button>

                  {mobileGovernanceOpen && (
                    <ul className="mt-1 space-y-1 border-l border-white/20 pl-3">
                      {governanceLinks.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.to}
                          onClick={closeMobileMenu}
                          className="block rounded-lg px-3 py-3 text-center text-sm text-white/90 transition hover:text-[#1F7A3F]"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    </ul>
                  )}
                </li>

                {navLinks.slice(3).map((link) => (
                  <li key={link.to} className="w-full">
                    <NavLink
                      to={link.to}
                      end={link.to === "/"}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `block w-full rounded-lg px-3 py-3 text-center text-sm ${
                          isActive
                            ? "font-semibold text-[#1F7A3F]"
                            : "text-white hover:text-[#1F7A3F]"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile authentication controls */}
            <div className="mt-3 border-t border-white/20 pt-3">
              {isLoggedIn ? (
                <div className="flex flex-col gap-1">
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="block rounded-lg px-3 py-3 text-center text-sm hover:bg-white/10"
                  >
                    My Account
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-lg px-3 py-3 text-center text-sm text-white hover:bg-white/10"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/signup"
                    onClick={closeMobileMenu}
                    className="inline-flex items-center justify-center rounded-full bg-[#1F7A3F] px-4 py-3 text-sm font-semibold hover:bg-[#1F7A3F]/80"
                  >
                    Sign Up
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white p-1 text-[#0B3C5D] shadow-md shadow-black/20 ml-5"
                      aria-hidden="true"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-4"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.span>
                  </Link>

                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="rounded-full border border-white/40 px-4 py-3 text-center text-sm hover:bg-white/10"
                  >
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}

export default Navbar;
