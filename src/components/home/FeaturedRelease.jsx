
function FeaturedRelease() {
  return (
    <section
      id="featured-release"
      className="bg-[#91AAB7] px-5 py-10 text-[#17252C] sm:px-8 sm:py-12 lg:px-12 lg:py-14"
    >
      <div className="mx-auto max-w-5xl">
        {/* Section label */}
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#1F7A3F]" />

          <p className="text-base font-semibold uppercase tracking-wide sm:text-xl text-black/65">
            Featured State Release
          </p>
        </div>

        {/* Release details */}
        <div className="mt-7 px-6">
          <h2 className="text-sm font-bold uppercase leading-6 sm:text-base">
            State Profile Update · September 2026
          </h2>

          <p className="mt-3 text-sm font-medium text-[#1F7A3F] sm:text-base">
            Lagos State: Health &amp; Education Indicators Refreshed
          </p>

          <p className="mt-4 max-w-3xl text-xs leading-6 text-[#344750] sm:text-sm">
            Updated ANC coverage, primary completion, and budget allocation
            figures are now verified and published for the state.
          </p>

          {/* View profile button */}
          <a
            href="/states/lagos"
            className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#1F7A3F] px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#176331] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B3C5D]"
          >
            View Lagos Profile

            <span
              className="flex size-5 items-center justify-center rounded-full bg-white text-[#1F7A3F]"
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
          </a>
        </div>
      </div>
    </section>
  );
}

export default FeaturedRelease;
