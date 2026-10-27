
import { useEffect, useRef, useState } from "react";
import civicIntelLogo from "../../assets/signup.logo.png";

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
      { label: "Sources & Method", href: "/sources-and-methods" },
      // { label: "Methodology", href: "/methodology" },
      // { label: "Revision History", href: "/revision-history" },
    ],
  },
];

function Footer() {
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const handleMotionChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    // Set up the observer without synchronously updating state.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    const footer = footerRef.current;

    if (footer && !motionQuery.matches) {
      observer.observe(footer);
    }

    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // Shared animation classes for every footer section.
  const revealClass = () =>
    `transition-[opacity,transform] duration-700 ease-out ${
      prefersReducedMotion ? "motion-reduce:transition-none" : ""
    } ${
      prefersReducedMotion || isVisible
        ? "translate-y-0 opacity-100"
        : "translate-y-8 opacity-0"
    }`;

  const getRevealDelay = (delay) =>
    prefersReducedMotion ? "0ms" : isVisible ? `${delay}ms` : "0ms";

  return (
    <footer
      ref={footerRef}
      className="w-full overflow-hidden bg-[#0B3C5D] text-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:px-16">
        {/* Main footer layout */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-2 sm:gap-x-8 md:grid-cols-4 md:gap-x-6 lg:gap-x-10">
          {/* Brand */}
          <div
            className={`${revealClass()} col-span-2 min-w-0 md:col-span-1`}
            style={{
              transitionDelay: getRevealDelay(0),
            }}
          >
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

          {/* Product and Trust */}
          {footerSections.map((section, index) => (
            <div
              key={section.title}
              className={`${revealClass()} min-w-0`}
              style={{
                transitionDelay: getRevealDelay(180 + index * 160),
              }}
            >
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
          <div
            className={`${revealClass()} min-w-0`}
            style={{
              transitionDelay: getRevealDelay(500),
            }}
          >
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider">
              Contact
            </h3>

            <ul className="space-y-3 text-sm text-white/75">
              <li>
                <a
                  href="mailto:contact@civicintelafrica.com"
                  className="break-all transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  contact@civicintelafrica.com
                </a>
              </li>

              <li>
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Facebook
                </a>
              </li>

              <li>
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Instagram
                </a>
              </li>

              <li>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div
          className={`${revealClass()} mt-10 border-t border-white/20 pt-6 sm:mt-12`}
          style={{
            transitionDelay: getRevealDelay(650),
          }}
        >
          <p className="text-center text-xs leading-5 text-white/65 sm:text-sm">
            &copy; {new Date().getFullYear()} Civic Intel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;