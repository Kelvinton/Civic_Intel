import OperatingRoom from "../../assets/category/operating.room.png";
import StudentsInClass from "../../assets/category/students.inclass.png";



const categories = [
  {
    id: "health",
    title: "Health Indicators",
    description:
      "Explore coverage, outcomes, and system indicators drawn from verified national surveys and administrative sources, filterable by state and year.",
    image: OperatingRoom ,
    imageAlt: "Healthcare professionals in a hospital operating room",
    metrics: [
      {
        value: "67.4%",
        label: "ANC 4+ Coverage (national)",
        trend: "2.1 pts vs prior year",
        positive: true,
      },
      {
        value: "512",
        label: "Maternal mortality ratio/100k",
        trend: "Improving trend",
        positive: false,
      },
    ],
    source: "NDHS • 2023 • Verified Aug 2026",
  },
  {
    id: "education",
    title: "Education Indicators",
    description:
      "Explore enrolment, completion, learning outcomes, teachers, examinations, infrastructure, and financing — filterable by state and year, with every figure traceable to its source.",
    image: StudentsInClass,
    imageAlt: "Schoolchildren participating in a classroom lesson",
    metrics: [
      {
        value: "68.2%",
        label: "Primary completion rate",
        trend: "1.4 pts vs prior year",
        positive: true,
      },
      {
        value: "10.5M",
        label: "Out-of-school children",
        trend: "Latest estimate",
        positive: null,
      },
    ],
    source: "UNICEF/EMIS • 2022 • Verified Aug 2026",
  },
];

function CategoryRow({ category, reverse = false }) {
  return (
    <article
      id={category.id}
      className="grid grid-cols-1 items-center gap-8 py-10 sm:gap-10 sm:py-14 lg:grid-cols-2 lg:gap-16 lg:py-16 "
    >
      {/* Image */}
      <div
        className={`min-w-0 ${reverse ? "lg:order-2" : "lg:order-2"}`}
      >
        <img
          src={category.image}
          alt={category.imageAlt}
          loading="lazy"
          className={`h-72 w-full object-cover sm:h-96 lg:h-108.5 ${
            reverse
              ? "rounded-bl-[5rem] rounded-tr-[5rem]"
              : "rounded-br-[5rem] rounded-tl-[5rem]"
          }`}
        />
      </div>

      {/* Text and metrics */}
      <div className={`min-w-0 ${reverse ? "lg:order-1" : "lg:order-1"}`}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#1F7A3F]">
          {category.title}
        </p>

        <p className="max-w-xl text-sm leading-6 text-gray-700 sm:text-base sm:leading-7">
          {category.description}
        </p>

        <div className="mt-7 grid grid-cols-2 gap-5">
          {category.metrics.map((metric) => (
            <div key={metric.label} className="min-w-0">
              <p className="text-lg font-bold text-black sm:text-xl">
                {metric.value}
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                {metric.label}
              </p>

              <div className="flex items-center gap-1 mt-2">
                {/* Geometric Polygon Indicator */}
                {metric.positive === true && (
                  <div className="w-2 h-2 bg-[#1F7A3F] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
                )}
                {metric.positive === false && (
                  <div className="w-2 h-2 bg-red-600 [clip-path:polygon(50%_100%,0%_0%,100%_0%)]" />
                )}

                <p
                  className={`text-[10px] leading-4 ${
                    metric.positive === true
                      ? "text-[#1F7A3F]"
                      : metric.positive === false
                        ? "text-red-600"
                        : "text-gray-500"
                  }`}
                >
                  {metric.trend}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500 sm:text-center">
          {category.source}
        </p>
      </div>
    </article>
  );
}

function Categories() {
  return (
    <section id="categories" className="bg-white  text-black ">
        {/* Section heading */}
        <div className=" pt-12 pb-4 bg-[#dce3e6]" >
          <div className="flex items-center gap-2 px-5 sm:px-8 lg:px-2 mx-auto max-w-6xl">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1F7A3F]" />
            <h2 className="text-lg font-bold tracking-wide sm:text-3xl ">
              THE CATEGORIES
            </h2>
          </div>
        </div>
        
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-16">
        

        {/* Health: text left, image right */}
        <CategoryRow category={categories[0]} />

        {/* Education: image left, text right */}
        <article className="grid grid-cols-1 items-center gap-8 py-8 sm:gap-10 sm:py-14 lg:grid-cols-2 lg:gap-16  ">
          <div className="min-w-0">
            <img
              src={categories[1].image}
              alt={categories[1].imageAlt}
              loading="lazy"
              className="h-72 w-full rounded-bl-[5rem] rounded-tr-[5rem] object-cover sm:h-96 lg:h-102.5"
            />
          </div>

          <div className="min-w-0">
            <p className="max-w-xl text-sm leading-6 text-gray-700 sm:text-base sm:leading-7">
              {categories[1].description}
            </p>

            <div className="mt-7 grid grid-cols-2 gap-5">
              {categories[1].metrics.map((metric) => (
                <div key={metric.label} className="min-w-0">
                  <p className="text-lg font-bold sm:text-xl">
                    {metric.value}
                  </p>
                  
                  <p className="mt-1 text-xs leading-5 text-gray-500 ">
                    {metric.label}
                  </p>

                  <div className="flex items-center gap-1 mt-2">
                    {/* Geometric Polygon Indicator */}
                    {metric.positive === true && (
                      <div className="w-2 h-2 bg-[#1F7A3F] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
                    )}
                    {metric.positive === false && (
                      <div className="w-2 h-2 bg-red-600 [clip-path:polygon(50%_100%,0%_0%,100%_0%)]" />
                    )}

                    <p
                      className={`text-[10px] leading-4 ${
                        metric.positive === true
                          ? "text-[#1F7A3F]"
                          : metric.positive === false
                            ? "text-red-600"
                            : "text-gray-500"
                      }`}
                    >
                      {metric.trend}
                    </p>
                  </div>
                  
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-gray-500 sm:text-center">
              {categories[1].source}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

export default Categories;
