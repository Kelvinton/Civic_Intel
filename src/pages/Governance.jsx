
import { motion } from "framer-motion";
import governanceHero from "../assets/governance.hero.png";

function Governance() {
  return (
    <main className="min-h-screen bg-[#E8EEF1]">
        {/* HERO SECTION */}
        <section className="overflow-hidden bg-[#0B3C5D] px-5 py-16 text-white sm:px-8 lg:px-16 lg:py-24">
            <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
                {/* Hero Text */}
                <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                >
                <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-[#A9C5D8] sm:text-sm">
                    CivicIntel / Governance
                </p>

                <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                    Governance, Transparency & Accountability
                </h1>

                <p className="mt-6 max-w-xl text-base leading-8 text-[#E7ECEF] sm:text-lg">
                    Explore the principles of transparency, accountability, and
                    responsible public information that support informed
                    participation in Nigeria.
                </p>

                <div className="mt-8 h-1 w-20 rounded-full bg-[#1F7A3F]" />
                </motion.div>

                {/* Hero Image */}
                <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
                >
                <div className="overflow-hidden rounded-2xl ">
                    <img
                    src={governanceHero}
                    alt="Illustration representing governance, transparency and accountability in Nigeria"
                    className="h-[280px] w-full object-cover sm:h-[380px] lg:h-[460px]"
                    />
                </div>

                
                </motion.div>
            </div>
        </section>

        {/* GOVERNANCE OVERVIEW */}
        <section className="bg-[#082C40] px-5 py-16 text-white sm:px-8 lg:px-16 lg:py-20">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 max-w-2xl">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#A9C5D8]">
                    Understanding Governance
                </p>

                <h2 className="text-3xl font-bold sm:text-4xl">
                    What Good Governance Means
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#D6E1E7] sm:text-base">
                    Good governance is built on principles that encourage public trust,
                    responsible leadership, and informed citizen participation.
                </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                    number: "01",
                    title: "Transparency",
                    description:
                        "Making public information accessible, clear, and understandable.",
                    },
                    {
                    number: "02",
                    title: "Accountability",
                    description:
                        "Encouraging responsibility for decisions and the use of public resources.",
                    },
                    {
                    number: "03",
                    title: "Participation",
                    description:
                        "Recognising the role citizens play in public life and decision-making.",
                    },
                    {
                    number: "04",
                    title: "Rule of Law",
                    description:
                        "Supporting fairness, equal treatment, and respect for established laws.",
                    },
                ].map((item) => (
                    <motion.div
                    key={item.number}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="rounded-xl border border-white/10 bg-white/[0.06] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.1]"
                    >
                    <span className="text-sm font-bold text-[#78B58A]">
                        {item.number}
                    </span>

                    <h3 className="mt-5 text-xl font-semibold">
                        {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#D6E1E7]">
                        {item.description}
                    </p>
                    </motion.div>
                ))}
                </div>
            </div>
        </section>
    </main>
    );
}

export default Governance;
