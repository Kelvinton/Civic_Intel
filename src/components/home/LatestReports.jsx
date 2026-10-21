
import Category1 from "../../assets/latest report/category1.png";
import Category2 from "../../assets/latest report/category2.png";
import Category3 from "../../assets/latest report/category3.png";

const reports = [
  {
    id: 1,
    category: "HEALTH",
    title: "Understanding Maternal Health Across Nigerian States",
    description:
      "Explore maternal health coverage and the differences in access to care across states.",
    date: "September 2026",
    image:
      Category3,
    imageAlt: "Healthcare professional working in a clinical setting",
    href: "/reports/maternal-health",
  },
  {
    id: 2,
    category: "EDUCATION",
    title: "Primary School Completion: A State-by-State View",
    description:
      "Examine education completion indicators and identify differences between states.",
    date: "August 2026",
    image:
      Category2,
    imageAlt: "Students participating in a classroom lesson",
    href: "/reports/primary-school-completion",
  },
  {
    id: 3,
    category: "PUBLIC FINANCE",
    title: "How States Allocate Health and Education Budgets",
    description:
      "Review public spending indicators and how budget allocations vary across states.",
    date: "August 2026",
    image:
      Category1,
    imageAlt: "Financial documents and calculations on a desk",
    href: "/reports/state-budgets",
  },
];

function LatestReports() {
  return (
    <section
      id="latest-reports"
      className="bg-gray-200 px-5 py-12  sm:px-8 sm:py-16 lg:px-14"
    >
      <div className="mx-auto max-w-5xl">
        {/* Section heading */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1F7A3F]" />

            <h2 className="text-lg font-bold tracking-wide sm:text-xl">
              LATEST REPORTS
            </h2>
          </div>

          <a
            href="/reports"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#1F7A3F]  sm:text-sm"
          >
            View All Releases

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12h15m0 0-6.75-6.75M19.5 12l-6.75 6.75"
              />
            </svg>
          </a>
        </div>

        {/* Report cards */}
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 px-5">
          {reports.map((report) => (
            <article
              key={report.id}
              className="group flex min-w-0 flex-col overflow-hidden rounded-xl
                border border-gray-300 bg-white
                transition-all duration-300
                hover:-translate-y-1 hover:border-[#1F7A3F] hover:shadow-lg
                active:scale-[0.99]
                focus-within:border-[#1F7A3F]"
            >
              {/* Image */}
              <a
                href={report.href}
                aria-label={`Read ${report.title}`}
                className="block overflow-hidden"
              >
                <img
                  src={report.image}
                  alt={report.imageAlt}
                  loading="lazy"
                  className="h-48 w-full border border-gray-300 object-cover
                  transition-transform duration-500
                  group-hover:scale-105
                  group-active:scale-[1.02]
                  sm:h-52"
                />
              </a>

              {/* Card content */}
              <div className="flex flex-1 flex-col p-5 text-black">
                <p className="text-[10px] font-semibold tracking-widest ">
                  {report.category}
                </p>

                <h3 className="mt-3 text-base font-semibold leading-6 text-black">
                  <a
                    href={report.href}
                    className="transition-colors duration-300
                  hover:text-[#1F7A3F]
                  active:text-[#1F7A3F]
                  focus-visible:outline-2
                  focus-visible:outline-offset-4
                  focus-visible:outline-[#65C98A]" 
                  >
                    {report.title}
                  </a>
                </h3>

                <p className="mt-3 text-sm leading-6 text-black">
                  {report.description}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                  <span className="text-xs text-black">
                    {report.date}
                  </span>

                  {/* <a
                    href={report.href}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#65C98A] hover:text-white"
                  >
                    Read report
                    <span aria-hidden="true">↗</span>
                  </a> */}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LatestReports;
