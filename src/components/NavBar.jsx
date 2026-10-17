
import civicIntelLogo from "../assets/civicintellogo1.png";

const basePath = "/Civic-Intel";

const navLinks = [
  { label: "Home", href: `${basePath}/` },
  { label: "Health", href: `${basePath}/health` },
  { label: "Education", href: `${basePath}/education` },
  { label: "Governance", href: `${basePath}/governance` },
  { label: "States", href: `${basePath}/states` },
  { label: "Explore", href: `${basePath}/explore` },
  {
    label: "Sources & Methods",
    href: `${basePath}/sources-and-methods`,
  },
];

function NavBar() {
  return (
    <header className="w-full bg-[#0B3C5D] text-white shadow-md">
      <div className="mx-auto max-w-7xl p-2 sm:px-6 lg:px-8">
        <div className="flex min-h-20 items-center justify-between gap-6">
          {/* Logo */}
          <a
            href={`${basePath}/`}
            className="flex shrink-0 items-center gap-3"
            aria-label="CivicIntel home"
          >
            <img
              src={civicIntelLogo}
              alt="CivicIntel logo"
              className="h-12 w-auto max-w-[250px] rounded-md bg-white/55 object-contain p-2"
            />
          </a>

          {/* Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden flex-1 items-center justify-center lg:flex"
          >
            <ul className="flex items-center gap-1 xl:gap-3">
              {navLinks.map((link, index) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    aria-current={index === 0 ? "page" : undefined}
                    className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/10 ${
                      index === 0
                        ? "font-semibold text-[#1F7A3F]"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop authentication actions */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <a
              href={`${basePath}/signup`}
              className="inline-flex items-center gap-2 rounded-full bg-[#1F7A3F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#176331]"
            >
              Sign Up
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0B3C5D"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12h15m-7.5-7.5L19.5 12 12 19.5"
                  />
                </svg>
              </span>
            </a>

            <a
              href={`${basePath}/login`}
              className="rounded-full border border-white/50 px-4 py-2 text-base font-medium transition-colors hover:bg-white/10"
            >
              Log In
            </a>
          </div>

          {/* Mobile menu */}
          <details className="relative lg:hidden">
            <summary
              aria-label="Toggle navigation menu"
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-lg border border-white/30 transition-colors hover:bg-white/10 [&::-webkit-details-marker]:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </summary>

            <nav
              aria-label="Mobile navigation"
              className="absolute right-0 top-14 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-[#0B3C5D] p-4 shadow-xl"
            >
              <ul className="flex flex-col gap-1">
                {navLinks.map((link, index) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      aria-current={index === 0 ? "page" : undefined}
                      className={`block rounded-lg px-4 py-3 transition-colors hover:bg-white/10 ${
                        index === 0 ? "bg-white/10 font-semibold" : ""
                      }`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-col gap-3 border-t border-white/20 pt-4">
                <a
                  href={`${basePath}/signup`}
                  className="rounded-full bg-[#1F7A3F] px-4 py-3 text-center font-semibold hover:bg-[#176331]"
                >
                  Sign Up →
                </a>

                <a
                  href={`${basePath}/login`}
                  className="rounded-full border border-white/40 px-4 py-3 text-center font-medium hover:bg-white/10"
                >
                  Log In
                </a>
              </div>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
