
import { useEffect, useState } from "react";
import Media1 from "../assets/media1.png";
import Media2 from "../assets/media2.png";
import Media3 from "../assets/media3.png";

const heroSlides = [
  {
    title: "Media and Releases",
    subtitle:
      "Explore weekly releases, visual explainers, and data stories from CivicIntel.",
    image:
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1800&q=85",
  },
  {
    title: "Stories Behind the Data",
    subtitle:
      "Discover the people, communities, and public services behind the numbers.",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1800&q=85",
  },
  {
    title: "Health and Wellbeing",
    subtitle:
      "Explore insights into healthcare access, outcomes, and public health.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1800&q=85",
  },
  {
    title: "Education in Focus",
    subtitle:
      "Follow the data shaping education, learning, and opportunities across Nigeria.",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=85",
  },
  {
    title: "Evidence for Better Decisions",
    subtitle:
      "Read reports and data stories supporting informed public decision-making.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1800&q=85",
  },
];

const releases = [
  {
    id: 1,
    title: "Lagos state budget",
    category: "Health",
    date: "Aug 20, 2026",
    source: "Lagos State Ministry of Health",
    image: Media1,
  },
  {
    id: 2,
    title: "Health awareness and community wellbeing",
    category: "Health",
    date: "Aug 20, 2026",
    source: "CivicIntel Research",
    image: Media2,
  },
  {
    id: 3,
    title: "Primary school enrollment",
    category: "Education",
    date: "Sept 20, 2026",
    source: "Open Source",
    image: Media3,
  },
  {
    id: 4,
    title: "Lagos state budget",
    category: "Health",
    date: "Aug 20, 2026",
    source: "Lagos State Ministry of Health",
    image: Media1,
  },
  {
    id: 5,
    title: "Health awareness and community wellbeing",
    category: "Health",
    date: "Aug 20, 2026",
    source: "CivicIntel Research",
    image: Media2,
  },
  {
    id: 6,
    title: "Primary school enrollment",
    category: "Education",
    date: "Sept 20, 2026",
    source: "Open Source",
    image: Media3,
  },
];

const years = ["All years", "2026", "2025", "2024", "2023"];

function Media() {
  const [activeSlide, setActiveSlide] = useState(2);
  const [category, setCategory] = useState("All categories");
  const [year, setYear] = useState("All years");

  // Automatically advance the hero carousel.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const currentSlide = heroSlides[activeSlide];

  const filteredReleases = releases.filter((release) => {
    const matchesCategory =
      category === "All categories" || release.category === category;

    const matchesYear =
      year === "All years" || release.date.includes(year);

    return matchesCategory && matchesYear;
  });

  return (
    <main className="bg-[#E7ECEF] text-[#082B40]">
      {/* HERO CAROUSEL */}
      <section
        className="relative flex min-h-105 items-center justify-center overflow-hidden bg-[#061E2C] px-5 py-20 text-center text-white sm:min-h-120 lg:min-h-120"
        aria-label="Featured media stories"
      >
        {heroSlides.map((slide, index) => (
          <div
            key={slide.title}
            aria-hidden={index !== activeSlide}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ))}

        {/* Dark overlay keeps the text readable. */}
        <div className="absolute inset-0 bg-black/65" />

        <div
          key={currentSlide.title}
          className="relative z-10 mx-auto max-w-3xl animate-[fadeIn_700ms_ease-out]"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#55B879]">
            CivicIntel Media
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {currentSlide.title}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
            {currentSlide.subtitle}
          </p>
        </div>

        {/* Clickable carousel indicators */}
        <div
          className="absolute bottom-12 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5"
          role="group"
          aria-label="Choose featured slide"
        >
          {heroSlides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Show slide ${index + 1}: ${slide.title}`}
              aria-pressed={activeSlide === index}
              className={`h-3 w-3 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                activeSlide === index
                  ? "scale-110 bg-[#1F7A3F]"
                  : "bg-white hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="relative z-20 -mt-8 px-5 sm:-mt-10">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-5 rounded-4xl bg-[#062638] p-5 text-white shadow-xl sm:grid-cols-2 sm:p-6">
          <div>
            <label
              htmlFor="media-category"
              className="mb-2 block text-sm font-medium"
            >
              Search Media
            </label>
            <select
              id="media-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#1F7A3F]"
            >
              <option>All categories</option>
              <option>Health</option>
              <option>Education</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="media-year"
              className="mb-2 block text-sm font-medium"
            >
              Filter by year
            </label>
            <select
              id="media-year"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#1F7A3F]"
            >
              {years.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* MEDIA RELEASES */}
      <section className="px-5 pb-16 pt-14 sm:px-8 sm:pb-20 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1F7A3F]">
                Newsroom
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#0B3C5D] sm:text-3xl">
                Latest Media Releases
              </h2>
            </div>

            <p className="text-sm text-gray-600">
              {filteredReleases.length}{" "}
              {filteredReleases.length === 1 ? "release" : "releases"}
            </p>
          </div>

          {filteredReleases.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {filteredReleases.map((release) => (
                <article
                  key={release.id}
                  className="group min-w-0"
                >
                  <div className="overflow-hidden rounded-tl-[52px] rounded-br-[52px] bg-gray-300">
                    <img
                      src={release.image}
                      alt={release.title}
                      loading="lazy"
                      className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-64"
                    />
                  </div>

                  <div className="space-y-3 pt-4 text-sm">
                    <p className="flex gap-3">
                      <span className="shrink-0 font-semibold text-[#14552E]">
                        Title:
                      </span>
                      <span className="text-gray-600">
                        {release.title}
                      </span>
                    </p>

                    <p className="flex gap-3">
                      <span className="shrink-0 font-semibold text-[#14552E]">
                        Category:
                      </span>
                      <span className="text-gray-600">
                        {release.category}
                      </span>
                    </p>

                    <p className="flex gap-3">
                      <span className="shrink-0 font-semibold text-[#14552E]">
                        Published date:
                      </span>
                      <span className="text-gray-600">
                        {release.date}
                      </span>
                    </p>

                    <p className="flex gap-3">
                      <span className="shrink-0 font-semibold text-[#14552E]">
                        Source:
                      </span>
                      <span className="text-gray-600">
                        {release.source}
                      </span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-300 bg-white p-10 text-center">
              <h3 className="font-semibold text-[#0B3C5D]">
                No releases found
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Try selecting another category or year.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCategory("All categories");
                  setYear("All years");
                }}
                className="mt-4 rounded-full bg-[#1F7A3F] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#176331]"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* MEDIA INQUIRIES */}
      <section className="bg-white px-5 py-10 text-center sm:py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-[#14552E]">
            Media Inquiries
          </h2>

          <p className="mt-4 text-sm leading-6 text-gray-600">
            For interviews, press information, expert commentary, or
            partnership opportunities, contact our media team.
          </p>

          <a
            href="mailto:civicintel@gmail.com"
            className="mt-3 inline-block text-sm font-medium text-[#14552E] transition hover:underline"
          >
            Email: civicintel@gmail.com
          </a>
        </div>
      </section>
    </main>
  );
}

export default Media;
