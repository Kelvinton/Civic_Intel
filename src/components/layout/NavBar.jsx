
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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
  `whitespace-nowrap rounded-lg px-2.5 py-2 text-sm transition-colors
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
   ${
     isActive
       ? " font-semibold text-[#1F7A3F]"
       : "text-white/90  hover:text-[#1F7A3F]"
   }`;

function NavBar({ isLoggedIn = false, onLogout }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Close the mobile menu when the user presses Escape
  // or clicks outside the menu.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        closeMobileMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      if (onLogout) {
        await onLogout();
      }

      closeMobileMenu();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const AuthLinks = ({ mobile = false }) => {
    const containerClass = mobile
      ? "mt-4 flex flex-col gap-3 border-t border-white/15 pt-4"
      : "hidden shrink-0 items-center gap-2 xl:flex";

    const buttonWidth = mobile ? "w-full" : "";

    return (
      <div className={containerClass}>
        {isLoggedIn ? (
          <>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span
                className="size-2 shrink-0 rounded-full bg-emerald-400"
                aria-hidden="true"
              />
              <span>Signed in</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className={`${buttonWidth} rounded-full border border-white/40 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {loggingOut ? "Logging out..." : "Log Out"}
            </button>
          </>
        ) : (
          <>
            <Link
              to="/signup"
              onClick={closeMobileMenu}
              className={`${buttonWidth} inline-flex items-center justify-center gap-2 rounded-full bg-[#1F7A3F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#176331] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
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
                  className="size-4"
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
              onClick={closeMobileMenu}
              className={`${buttonWidth} rounded-full border border-white/40 px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
            >
              Log In
            </Link>
          </>
        )}
      </div>
    );
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-white/10 bg-[#0B3C5D] text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-18 items-center justify-between gap-3 sm:min-h-20">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex min-w-0 shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="CivicIntel home"
          >
            <img
              src={civicIntelLogo}
              alt="CivicIntel"
              className="h-10 w-auto max-w-36.25 rounded-md bg-white/65 p-1.5 object-contain sm:h-12 sm:max-w-48"
            />
          </Link>

          {/* Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden min-w-0 flex-1 justify-center xl:flex"
          >
            <ul className="flex items-center gap-0.5 2xl:gap-1">
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
          <div
            ref={menuRef}
            className="relative ml-auto shrink-0 xl:hidden"
          >
            <button
              type="button"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() =>
                setMobileMenuOpen((isOpen) => !isOpen)
              }
              className="flex size-11 items-center justify-center rounded-xl border border-white/30 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {mobileMenuOpen ? (
                // Close icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="size-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              ) : (
                // Hamburger icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="size-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>

            {/* Mobile dropdown */}
            {mobileMenuOpen && (
              <nav
                id="mobile-navigation"
                aria-label="Mobile navigation"
                className="absolute right-0 top-full mt-3 max-h-[calc(100dvh-6rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-[#0B3C5D] p-4 shadow-2xl"
              >

                <ul className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <li key={link.to}>
                      <NavLink
                        to={link.to}
                        end={link.to === "/"}
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                          `flex min-h-11 items-center rounded-xl px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                            isActive
                              ? "bg-white/10 font-semibold text-white"
                              : "text-white/85 hover:bg-white/10 hover:text-white"
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default NavBar;