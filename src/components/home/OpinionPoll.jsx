import { useState } from "react";
const pollOptions = [
  "Reducing inflation and food prices",
  "Strengthening the Naira",
  "Creating more jobs",
  "Improving electricity supply",
  "Supporting small businesses",
  "Technological improvement",
  "Others",
];

function OpinionPoll() {
  const [selectedOption, setSelectedOption] = useState("");
  const [otherOpinion, setOtherOpinion] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isOtherSelected = selectedOption === "Others";

  function handleSubmit(event) {
    event.preventDefault();
    if (!selectedOption) return;
    if (isOtherSelected && !otherOpinion.trim()) return;

    const response = isOtherSelected ? otherOpinion.trim() : selectedOption;

    // Demo only. Replace this with your backend/API later.
    console.log("Opinion poll response:", response);
    setSubmitted(true);
  }

  function handleOptionChange(option) {
    setSelectedOption(option);
    setSubmitted(false);
  }

  return (
    <section
      id="opinion-poll"
      className="overflow-hidden px-5 py-8 text-white sm:px-8 sm:py-10 lg:px-20 lg:py-11 bg-gray-300"
    >
      <div className="mx-auto max-w-6xl bg-[#061B27] p-8 rounded-4xl">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* CivicIntel icon */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 shrink-0 text-[#1F7A3F]"
              aria-hidden="true"
            >
              <rect x="2" y="10" width="5" height="12" rx="2.5" />
              <rect x="9.5" y="2" width="5" height="20" rx="2.5" />
              <rect x="17" y="6" width="5" height="16" rx="2.5" />
            </svg>

            <h2 className="text-base font-bold uppercase tracking-wide text-[#1F7A3F] sm:text-xl">
              CivicIntel’s Opinion Poll
            </h2>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-[#B8C2C9] sm:text-right sm:text-sm">
            {/* Database / lock icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-6 w-6 shrink-0 text-white"
              aria-hidden="true"
            >
              <ellipse cx="10" cy="5" rx="7" ry="3" />
              <path d="M3 5v12c0 1.7 3.1 3 7 3" />
              <path d="M17 5v7M3 9c0 1.7 3.1 3 7 3M3 13c0 1.7 3.1 3 7 3M3 17c0 1.7 3.1 3 7 3" />
              <rect x="15" y="14" width="7" height="7" rx="1.5" />
              <path d="M17 14v-1a1.5 1.5 0 0 1 3 0v1" />
            </svg>

            <span>Poll closes on 31st October, 2026</span>
          </div>
        </div>

        {/* Poll introduction */}
        <div className="mt-7 max-w-180">
          <h3 className="text-xl font-bold leading-snug tracking-[-0.02em] sm:text-2xl">
            What do you think the Federal Government should improve the most in
            the 2027 economy?
          </h3>

          <p className="mt-3 text-sm leading-6 text-[#B8C2C9] sm:text-base">
            Help us understand what Nigerians think should receive the utmost
            attention.
          </p>
        </div>

        {/* Poll form */}
        <form onSubmit={handleSubmit} className="mt-6">
          <fieldset>
            <legend className="sr-only">
              Select the area the Federal Government should prioritise
            </legend>

            <div className="grid max-w-190 grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2 sm:gap-x-12">
              {pollOptions.map((option) => (
                <label
                  key={option}
                  className="flex min-h-6 cursor-pointer items-center gap-4 text-sm text-[#F3F5F6] transition-colors hover:text-white"
                >
                  <input
                    type="radio"
                    name="economy-priority"
                    value={option}
                    checked={selectedOption === option}
                    onChange={() => handleOptionChange(option)}
                    className="h-5.25 w-5.25 shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-[#687782] bg-transparent transition checked:border-[#1F7A3F] checked:bg-[#24834F] checked:shadow-[inset_0_0_0_5px_#061B27] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3CA66B]"
                  />

                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          
          {isOtherSelected && (
            <div className="mt-6 w-full max-w-xl rounded-2xl bg-[#2D3139] px-5 py-4 focus-within:ring-2 focus-within:ring-[#24834F] transition-shadow">
              <label htmlFor="other-opinion" className="sr-only">
                What else do you think?
              </label>
              <input
                type="text"
                id="other-opinion"
                value={otherOpinion}
                onChange={(event) => {
                  setOtherOpinion(event.target.value);
                  setSubmitted(false);
                }}
                placeholder="What else do you think?"
                required
                className="w-full bg-transparent text-sm text-[#A3A6AA] placeholder:text-[#A3A6AA]/60 outline-none border-none p-0 focus:text-white focus:placeholder-transparent"
              />
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={
              !selectedOption || (isOtherSelected && !otherOpinion.trim())
            }
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-4 rounded-full bg-white px-4 py-3 text-sm font-medium text-[#1F7A3F] transition hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <span>Submit Feedback</span>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M4 12h16M13 5l7 7-7 7" />
            </svg>
          </button>

          {/* Submission confirmation */}
          {submitted && (
            <p
              role="status"
              aria-live="polite"
              className="mt-4 text-sm leading-6 text-[#77D69A]"
            >
              Thank you for sharing your opinion. Your response has been
              received in this demo.
            </p>
          )}
        </form>

        {/* Privacy notice */}
        <div className="mt-6 flex items-start gap-3 text-xs leading-5 text-[#B8C2C9] sm:mt-7 sm:items-center sm:text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hat-glasses preview-icon"><path d="M14 18a2 2 0 0 0-4 0"/><path d="m19 11-2.11-6.657a2 2 0 0 0-2.752-1.148l-1.276.61A2 2 0 0 1 12 4H8.5a2 2 0 0 0-1.925 1.456L5 11"/><path d="M2 11h20"/><circle cx="17" cy="18" r="3"/><circle cx="7" cy="18" r="3"/></svg>

          <p>
            Your response is anonymous. Results will be published when the poll
            closes.
          </p>
        </div>
      </div>
    </section>
  );
}

export default OpinionPoll;
