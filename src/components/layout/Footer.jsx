
import civicIntelLogo from "../../assets/civicintel.footer.logo.png";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Health", href: "/health" },
      { label: "Education", href: "/education" },
      { label: "States", href: "/states" },
      { label: "Explore", href: "/explore" },
      { label: "Media", href: "/media" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Sources & Method", href: "/methodology" },
      { label: "Methodology", href: "/methodology" },
      { label: "Revision History", href: "/revision-history" },
    ],
  },
];

function Footer() {
  return (
    <footer className="w-full bg-[#0B3C5D] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:px-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.7fr_0.9fr_1.2fr] lg:gap-x-8 lg:gap-y-10">

          {/* Logo and description */}
          <div className="min-w-0 lg:mr-8">
            <a
              href="/"
              aria-label="Civic Intel home"
              className="inline-flex items-center"
            >
              <img
                src={civicIntelLogo}
                alt="Civic Intel"
                className="h-16 w-auto max-w-full object-contain"
              />
            </a>

            <p className="mt-4 max-w-xs text-sm leading-6 text-white/75">
              A public data platform for health and education indicators.
              Exploring Nigeria through reliable data and insights.
            </p>
          </div>

          {/* Product and Trust links */}
          {footerSections.map((section) => (
            <div key={section.title} className="min-w-0">
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider">
                {section.title}
              </h3>

              <ul className="space-y-3 text-sm text-white/75">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="wrap-break-word transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div className="min-w-0">
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider">
              Contact
            </h3>

            <ul className="space-y-3 text-sm text-white/75">
              <li>
                <a
                  href="mailto:contact@civicintelafrica.com"
                  className="break-all transition-colors hover:text-white"
                >
                  contact@civicintelafrica.com
                </a>
              </li>

              <li>
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  Facebook
                </a>
              </li>

              <li>
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  Instagram
                </a>
              </li>

              <li>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-white/20 pt-6">
          <p className="text-center text-xs leading-5 text-white/65 sm:text-sm">
            &copy; {new Date().getFullYear()} Civic Intel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
