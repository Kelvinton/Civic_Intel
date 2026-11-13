
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const faqStats = [
  { value: "12", label: "Questions answered" },
  { value: "5", label: "Topic categories" },
  { value: "2026", label: "Last updated" },
];

const faqCategories = [
  { id: "all", label: "All Questions", count: 12 },
  { id: "registration", label: "Registration & PVC", count: 3 },
  { id: "voting", label: "Voting Process", count: 3 },
  { id: "technology", label: "BVAS & Technology", count: 2 },
  { id: "rights", label: "Your Rights", count: 2 },
  { id: "results", label: "Results & Disputes", count: 2 },
];

const faqQuestions = [
  {
    id: 1,
    category: "registration",
    question: "How do I register to vote in Nigeria?",
    answer:
      "Voter registration is managed by the Independent National Electoral Commission (INEC). Visit an official INEC registration centre or use an official registration channel when available. Check INEC announcements for current registration requirements and dates.",
  },
  {
    id: 2,
    category: "registration",
    question: "How can I check my voter registration status?",
    answer:
      "You can check your registration status through INEC's official voter verification services. Use the official INEC website and follow its instructions.",
  },
  {
    id: 3,
    category: "registration",
    question: "Can I transfer my voter registration to another state?",
    answer:
      "INEC provides a voter transfer process for eligible registered voters. Check the official INEC website or visit an INEC office for the current procedure.",
  },
  {
    id: 4,
    category: "voting",
    question: "What should I bring to my polling unit?",
    answer:
      "Bring your Permanent Voter's Card (PVC). Follow INEC's official election guidelines for any additional instructions that apply to the election.",
  },
  {
    id: 5,
    category: "voting",
    question: "How do I find my polling unit?",
    answer:
      "Use INEC's official voter verification tools to confirm your polling unit before election day. Make sure you check the location ahead of time.",
  },
  {
    id: 6,
    category: "voting",
    question: "What happens if I arrive after voting has started?",
    answer:
      "Follow the instructions of election officials at your polling unit. Check INEC's official guidelines for the applicable voting hours and procedures.",
  },
  {
    id: 7,
    category: "technology",
    question: "What is BVAS?",
    answer:
      "BVAS means Bimodal Voter Accreditation System. It is an electronic device used by INEC for voter accreditation during elections.",
  },
  {
    id: 8,
    category: "technology",
    question: "What happens if the BVAS device fails?",
    answer:
      "Election officials are expected to follow INEC's prescribed procedures for technical problems. Report any concerns to the appropriate election officials.",
  },
  {
    id: 9,
    category: "rights",
    question: "Can I vote if I have a disability?",
    answer:
      "Eligible voters with disabilities have the right to participate in elections. INEC provides guidelines and support measures for accessible voting.",
  },
  {
    id: 10,
    category: "rights",
    question: "Is my vote confidential?",
    answer:
      "Yes. Voting is conducted by secret ballot. You should not be forced to reveal or prove who you voted for.",
  },
  {
    id: 11,
    category: "results",
    question: "Where can I find official election results?",
    answer:
      "Refer to INEC's official website and verified announcements for authoritative election results. CivicIntel provides public-interest information and data, but is not the official election authority.",
  },
  {
    id: 12,
    category: "results",
    question: "How can I report an election-related complaint?",
    answer:
      "You can report concerns through the appropriate INEC channels or lawful electoral complaint procedures. Keep relevant information and evidence, and consult official guidance.",
  },
];

function FAQ() {
    const [activeCategory, setActiveCategory] = useState("all");
    const [openQuestion, setOpenQuestion] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const categoryQuestions =
        activeCategory === "all"
            ? faqQuestions
            : faqQuestions.filter(
                (item) => item.category === activeCategory
            );

        const filteredQuestions = categoryQuestions.filter((item) =>
        `${item.question} ${item.answer}`
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase())
    );
  return (
    <main className="min-h-screen bg-[#F7F8F7]">
      {/* FAQ Header */}
      <section className="bg-[#F7F8F7] px-5 py-12 sm:px-8 lg:py-16 mt-10">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1fr_320px]">

          {/* Heading */}
          <div>
            <div className="mb-5 flex items-center gap-2 text-xs text-gray-500">
              <Link to="/" className="transition hover:text-[#1F7A3F]">
                Home
              </Link>
              <span>/</span>
              <span className="font-medium text-[#0B3C5D]">
                Frequently Asked Questions
              </span>
            </div>

            <span className="inline-block rounded-full bg-[#DDF1E4] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#1F7A3F]">
              FAQ Library
            </span>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#0B3C5D] sm:text-4xl">
              Frequently Asked{" "}
              <span className="text-[#1F7A3F]">Questions</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-gray-600">
              Clear, verified answers to common questions about CivicIntel,
              Nigerian elections, and how to use the platform.
              Find the information you need quickly and easily.
            </p>
          </div>

          {/* Statistics Card */}
          <div className="rounded-2xl bg-linear-to-br from-[#1F7A3F] to-[#0B3C5D] p-6 text-white shadow-lg">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
              FAQ Library
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {faqStats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-[9px] leading-4 text-white/70">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-white/10 p-3">
              <p className="text-xs font-semibold">
                Find the answers you need.
              </p>
              <p className="mt-1 text-[10px] leading-5 text-white/70">
                Explore verified information about CivicIntel and
                Nigeria's electoral process.
              </p>
            </div>
          </div>

        </div>
      </section>

      <section className="bg-[#D8E7EF] px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[250px_1fr]">

            {/* Category Sidebar */}
            <aside className="h-fit rounded-2xl border border-white/70 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-[#0B3C5D]">
                Browse by topic
            </h2>

            <div className="space-y-2">
                {faqCategories.map((category) => (
                <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                    setActiveCategory(category.id);
                    setOpenQuestion(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-xs transition ${
                    activeCategory === category.id
                        ? "bg-[#1F7A3F] font-semibold text-white"
                        : "text-gray-600 hover:bg-[#EAF2ED] hover:text-[#1F7A3F]"
                    }`}
                >
                    <span>{category.label}</span>

                    <span
                    className={`rounded-full px-2 py-1 text-[10px] ${
                        activeCategory === category.id
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                    >
                    {category.count}
                    </span>
                </button>
                ))}
            </div>
            </aside>

            {/* FAQ Questions */}
            <div className="space-y-6">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        {searchTerm.trim()
                        ? `${filteredQuestions.length} ${
                            filteredQuestions.length === 1
                                ? "question"
                                : "questions"
                            } found`
                        : `Showing ${filteredQuestions.length} questions`}
                    </p>
                </div>
                <div className="relative">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search frequently asked questions..."
                        className="w-full rounded-xl border border-white bg-white px-5 py-4 text-sm text-[#0B3C5D] shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#1F7A3F] focus:ring-2 focus:ring-[#1F7A3F]/10"
                    />
                </div>
                {filteredQuestions.length === 0 ? (
                <div className="rounded-xl border border-white bg-white px-6 py-12 text-center shadow-sm">
                    <h2 className="text-sm font-bold text-[#0B3C5D]">
                    No questions found
                    </h2>
                    <p className="mt-2 text-xs text-gray-500">
                    Try another keyword or choose a different topic.
                    </p>
                </div>
                ) : activeCategory === "all" ? (
                    faqCategories
                    .filter((category) => category.id !== "all")
                    .map((category) => {
                        const questions = filteredQuestions.filter(
                        (item) => item.category === category.id
                        );

                        return (
                        <div key={category.id}>
                            <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-[#0B3C5D]">
                                {category.label}
                            </h2>

                            <span className="text-[10px] text-gray-500">
                                {questions.length} questions
                            </span>
                            </div>

                            <div className="space-y-3">
                            {questions.map((item) => (
                                <div
                                key={item.id}
                                className="overflow-hidden rounded-xl border border-white/70 bg-white shadow-sm"
                                >
                                <button
                                    type="button"
                                    onClick={() =>
                                    setOpenQuestion(
                                        openQuestion === item.id ? null : item.id
                                    )
                                    }
                                    aria-expanded={openQuestion === item.id}
                                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                                >
                                    <span className="text-sm font-semibold text-[#0B3C5D]">
                                    {item.question}
                                    </span>

                                    <ChevronDown
                                    size={18}
                                    className={`shrink-0 text-[#1F7A3F] transition-transform ${
                                        openQuestion === item.id ? "rotate-180" : ""
                                    }`}
                                    />
                                </button>

                                {openQuestion === item.id && (
                                    <div className="border-t border-gray-100 px-5 py-4">
                                    <p className="text-xs leading-7 text-gray-600">
                                        {item.answer}
                                    </p>
                                    </div>
                                )}
                                </div>
                            ))}
                            </div>
                        </div>
                        );
                    })
                ) : (
                    <div>
                        <h2 className="mb-4 text-sm font-bold text-[#0B3C5D]">
                            {faqCategories.find(
                            (category) => category.id === activeCategory
                            )?.label}
                        </h2>

                        <div className="space-y-3">
                            {filteredQuestions.map((item) => (
                            <div
                                key={item.id}
                                className="overflow-hidden rounded-xl border border-white/70 bg-white shadow-sm"
                            >
                                <button
                                type="button"
                                onClick={() =>
                                    setOpenQuestion(
                                    openQuestion === item.id ? null : item.id
                                    )
                                }
                                aria-expanded={openQuestion === item.id}
                                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                                >
                                <span className="text-sm font-semibold text-[#0B3C5D]">
                                    {item.question}
                                </span>

                                <ChevronDown
                                    size={18}
                                    className={`shrink-0 text-[#1F7A3F] transition-transform ${
                                    openQuestion === item.id ? "rotate-180" : ""
                                    }`}
                                />
                                </button>

                                {openQuestion === item.id && (
                                <div className="border-t border-gray-100 px-5 py-4">
                                    <p className="text-xs leading-7 text-gray-600">
                                    {item.answer}
                                    </p>
                                </div>
                                )}
                            </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
        </section>

        <section className="bg-[#F7F8F7] px-5 py-14 sm:px-8">
            <div className="mx-auto max-w-5xl rounded-2xl bg-linear-to-br from-[#0B3C5D] to-[#1F7A3F] px-6 py-10 text-center text-white shadow-lg sm:px-12">
                <h2 className="text-xl font-bold sm:text-2xl">
                Still have questions?
                </h2>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/75">
                Couldn't find the information you were looking for?
                Visit our contact page and we'll be glad to hear from you.
                </p>

                <a
                    href="mailto:contact@civicintelafrica.com"
                    className="mt-6 inline-flex items-center rounded-lg bg-white px-6 py-3 text-xs font-bold text-[#0B3C5D] transition hover:bg-[#EAF2ED]"
                    >
                    Contact Us
                </a>
            </div>
        </section>
    </main>
  );
}

export default FAQ;
