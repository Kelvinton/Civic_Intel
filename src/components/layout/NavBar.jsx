
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import civicIntelLogo from "../../assets/civicintellogo1.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Health", to: "/health" },
  { label: "Education", to: "/education" },
  { label: "Governance", to: "/governance" },
  { label: "States", to: "/states" },
  { label: "Explore", to: "/explore" },
  { label: "Sources & Methods", to: "/sources-and-methods" },
];

const getNavLinkClass = ({ isActive }) =>
  `whitespace-nowrap rounded-md px-2 py-2 text-sm transition-colors
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
   ${
     isActive
       ? "font-semibold text-[#1F7A3F]"
       : "text-white/90 hover:text-[#1F7A3F]"
   }`;

function NavBar({ isLoggedIn = false, onLogout }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      if (onLogout) {
        await onLogout();
      }

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const AuthLinks = ({ mobile = false }) => (
    <div
      className={
        mobile
          ? "mt-4 flex flex-col gap-3 border-t border-white/20 pt-4"
          : "hidden shrink-0 items-center gap-2 xl:flex"
      }
    >
      {isLoggedIn ? (
        <>
          <span className="text-sm text-white/80">
            Signed in
          </span>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className={`rounded-full border border-white/50 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60 ${
              mobile ? "w-full py-3" : ""
            }`}
          >
            {loggingOut ? "Logging out..." : "Log Out"}
          </button>
        </>
      ) : (
        <>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1F7A3F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#176331] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Sign Up
            <span
              className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0B3C5D"
                strokeWidth={1.8}
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12h15m-7.5-7.5L19.5 12 12 19.5"
                />
              </svg>
            </span>
          </Link>

          <Link
            to="/login"
            className={`rounded-full border border-white/50 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              mobile ? "py-3 text-center" : ""
            }`}
          >
            Log In
          </Link>
        </>
      )}
    </div>
  );

  return (
    <header className="relative z-50 w-full bg-[#0B3C5D] text-white shadow-sm">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex min-h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="CivicIntel home"
          >
            <img
              src={civicIntelLogo}
              alt="CivicIntel"
              className="h-11 w-auto max-w-40 rounded-md bg-white/65 p-1.5 object-contain sm:h-12 sm:max-w-48"
            />
          </Link>

          {/* Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden min-w-0 flex-1 justify-center lg:flex"
          >
            <ul className="flex items-center gap-0.5 xl:gap-1">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={getNavLinkClass}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop authentication */}
          <AuthLinks />

          {/* Mobile and tablet menu */}
          <details className="group relative ml-auto lg:hidden">
            <summary
              aria-label="Open navigation menu"
              className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg border border-white/30 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white [&::-webkit-details-marker]:hidden"
            >
              {/* Hamburger icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-6 w-6 group-open:hidden"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>

              {/* Close icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                className="hidden h-6 w-6 group-open:block"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              </svg>
            </summary>

            <nav
              aria-label="Mobile navigation"
              className="absolute right-0 top-full mt-3 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-white/15 bg-[#0B3C5D] p-4 shadow-xl"
            >
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      end={link.to === "/"}
                      className={({ isActive }) =>
                        `block rounded-lg px-4 py-3 text-sm transition-colors ${
                          isActive
                            ? "bg-white/10 font-semibold text-white"
                            : "text-white/90 hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <AuthLinks mobile />
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
