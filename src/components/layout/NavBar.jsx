
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import civicIntelLogo from "../../assets/civicintellogo1.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Health", to: "/health" },
  { label: "Education", to: "/education" },
  { label: "Governance", to: "/governance" },
  { label: "States", to: "/states" },
  { label: "Explore", to: "/explore" },
  { label: "Sources and Methods", to: "/sources-and-methods" },
];

function Navbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B3C5D] text-white shadow-md">
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
            className="h-12 w-auto max-w-15.5 rounded-md object-contain bg-white/55"
          />
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden flex-1 items-center justify-center lg:flex"
        >
          <ul className="flex items-center gap-5 xl:gap-8">
            {navLinks.map((link) => (
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

        {/* Logged-in controls */}
        {isLoggedIn ? (
          <div className="hidden shrink-0 items-center gap-6 lg:flex">
            {/* Notifications */}
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
                  className="h-7 w-7"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"
                  />
                </svg>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 rounded-xl bg-white p-4 text-sm text-gray-700 shadow-xl">
                  <p className="font-semibold text-[#0B3C5D]">
                    Notifications
                  </p>
                  <p className="mt-2 text-gray-500">
                    You’re all caught up.
                  </p>
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
                className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-4 border-[#1F7A3F] bg-white transition hover:scale-105"
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
                    className="h-8 w-8"
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
                    My Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Logged-out controls */
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/signup"
              className="rounded-full bg-[#1F7A3F] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#176331] inline-flex"
            >
              Sign Up

              <span
                className="flex size-5 items-center justify-center rounded-full bg-white text-[#1F7A3F] ml-4"
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#0B3C5D" 
                  stroke-width="1.8" 
                  class="w-4 h-4"
                  aria-hidden="true"
                >
                  <path 
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4.5 12h15m-7.5-7.5L19.5 12 12 19.5"
                  />
                </svg>
              </span>
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-white/50 px-5 py-2.5 text-sm transition hover:bg-white/10"
            >
              Log In
            </Link>
          </div>
        )}

        {/* Mobile menu */}
        <div className="relative lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
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

          {menuOpen && (
            <div className="absolute right-0 top-14 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl bg-[#0B3C5D] p-4 shadow-xl">
              <nav aria-label="Mobile navigation">
                <ul className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <li key={link.to}>
                      <NavLink
                        to={link.to}
                        end={link.to === "/"}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `block rounded-lg px-3 py-3 text-sm ${
                            isActive
                              ? "bg-white/10 font-semibold text-[#65C58A]"
                              : "text-white hover:bg-white/10"
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-3 border-t border-white/20 pt-3">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-3 text-sm hover:bg-white/10"
                    >
                      My Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-lg px-3 py-3 text-left text-sm text-white hover:bg-white/10"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-full bg-[#1F7A3F] px-4 py-3 text-center text-sm font-semibold"
                    >
                      Sign Up
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-full border border-white/40 px-4 py-3 text-center text-sm"
                    >
                      Log In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
