
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Turnstile } from "@marsidev/react-turnstile";

import {
  revealVariants,
  staggerContainer,
  useMotionSettings,
} from "../../animation.js";

import { apiRequest } from "../../api/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const TURNSTILE_SITE_KEY = "0x4AAAAAAF5u8SN5tnqNSyrE";
const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

// Dedicated animation for poll options.
const pollOptionVariants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function formatClosingDate(date) {
  if (!date) return "Closing date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Closing date unavailable";
  }

  return `Poll closes on ${parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

// Create or retrieve the guest device token.
function getGuestToken() {
  let guestToken = localStorage.getItem("civicintel_guest_token");

  if (!guestToken) {
    guestToken = crypto.randomUUID();
    localStorage.setItem("civicintel_guest_token", guestToken);
  }

  return guestToken;
}

// Create a separate storage key for each voter and poll.
function getPollStateKey(pollId, isLoggedIn, user) {
  if (!pollId) return null;

  if (isLoggedIn && user?.id) {
    return `civicintel_poll_state_user_${user.id}_${pollId}`;
  }

  if (!isLoggedIn) {
    return `civicintel_poll_state_guest_${getGuestToken()}_${pollId}`;
  }

  return null;
}

function OpinionPoll() {
  const motionSettings = useMotionSettings();
  const shouldReduceMotion = useReducedMotion();
  const { isLoggedIn, user } = useAuth();

  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [isStateLocked, setIsStateLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  useEffect(() => {
    if (!success) return;

    const timeout = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [success]);

  // Check whether the poll is still open.
  const isPollOpen =
  poll?.status === "open" && !isExpired;

  useEffect(() => {
    if (!poll?.closes_at) return;

    const closingTime = new Date(poll.closes_at).getTime();

    if (Number.isNaN(closingTime)) return;

    const delay = Math.max(0, closingTime - Date.now());

    const timeout = setTimeout(() => {
      setIsExpired(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [poll?.closes_at]);

  const hasVoted = Boolean(poll?.my_vote);

  // Fetch the available poll.
  useEffect(() => {
    let isMounted = true;

    async function loadPoll() {
      try {
        setLoading(true);
        setError("");

        const guestHeaders = !isLoggedIn
          ? { "X-Guest-Token": getGuestToken() }
          : {};

        const response = await apiRequest("/polls", {
          headers: guestHeaders,
        });

        const polls = Array.isArray(response?.items)
          ? response.items
          : [];

        if (!polls.length) {
          if (isMounted) {
            setPoll(null);
          }
          return;
        }

        // Prefer an open poll.
        // If there is no open poll, display the latest available poll.
        const sortedPolls = [...polls].sort(
          (a, b) =>
            new Date(b.created_at || 0) -
            new Date(a.created_at || 0)
        );

        const activePoll = sortedPolls.find(
          (item) =>
            item.status === "open" &&
            (!item.closes_at ||
              new Date(item.closes_at).getTime() > Date.now())
        );

        const selectedPoll = activePoll || sortedPolls[0];

        // Fetch full poll details, including options and results.
        const pollDetails = await apiRequest(
          `/polls/${selectedPoll.id}`,
          {
            headers: guestHeaders,
          }
        );

        if (isMounted) {
          const closingTime = pollDetails.closes_at
            ? new Date(pollDetails.closes_at).getTime()
            : null;

          setIsExpired(
            closingTime !== null &&
            !Number.isNaN(closingTime) &&
            closingTime <= Date.now()
          );

          setPoll(pollDetails);
          setSelectedOption(pollDetails.my_vote || "");

          const stateKey = getPollStateKey(
            pollDetails.id,
            isLoggedIn,
            { id: user?.id }
          );

          const savedState = stateKey
            ? localStorage.getItem(stateKey)
            : "";

          setSelectedState(savedState || "");
          setIsStateLocked(Boolean(savedState));
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message || "Unable to load the opinion poll."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPoll();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, user?.id]);

  
  // Submit a vote.
  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !poll ||
      !selectedOption ||
      !isPollOpen ||
      (!isLoggedIn && hasVoted)
    ) {
      return;
    }

    if (poll.requires_state && !selectedState) {
      setError("Please select your state of residence.");
      return;
    }

    // Guests can only vote when the poll allows it.
    if (!isLoggedIn && !poll.allow_guest_votes) {
      setError("This poll is only available to registered users.");
      return;
    }

    // Guest votes require CAPTCHA verification.
    if (!isLoggedIn && !captchaToken) {
      setError("Please complete the CAPTCHA before submitting your vote.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (isLoggedIn) {
        // Registered-user voting.
        await apiRequest(`/polls/${poll.id}/vote`, {
          method: "PUT",
          body: JSON.stringify({
            option_id: selectedOption,
            ...(poll.requires_state && { state: selectedState }),
          }),
        });
      } else {
        // Guest voting.
        await apiRequest(`/polls/${poll.id}/guest-vote`, {
          method: "POST",
          headers: {
            "X-Guest-Token": getGuestToken(),
          },
          body: JSON.stringify({
            option_id: selectedOption,
            captcha_token: captchaToken,
            ...(poll.requires_state && { state: selectedState }),
          }),
        });
      }

      // Remember the voter's state after a successful vote.
      if (poll.requires_state) {
        const stateKey = getPollStateKey(
          poll.id,
          isLoggedIn,
          user
        );

        if (stateKey) {
          localStorage.setItem(stateKey, selectedState);
          setIsStateLocked(true);
          
        }
      }

      // Fetch the latest poll details.
      const guestHeaders = !isLoggedIn
        ? { "X-Guest-Token": getGuestToken() }
        : {};

      const updatedPoll = await apiRequest(
        `/polls/${poll.id}`,
        {
          headers: guestHeaders,
        }
      );

      const closingTime = updatedPoll.closes_at
        ? new Date(updatedPoll.closes_at).getTime()
        : null;

      setIsExpired(
        closingTime !== null &&
        !Number.isNaN(closingTime) &&
        closingTime <= Date.now()
      );

      setPoll(updatedPoll);
      setSelectedOption(updatedPoll.my_vote || selectedOption);
      setCaptchaToken("");

      setSuccess(
        isLoggedIn
          ? "Thank you for sharing your opinion. Your vote has been received."
          : "Thank you for participating. Your vote has been received."
      );
    } catch (err) {
      setError(
        err.message || "Unable to submit your vote. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }


  function handleOptionChange(optionId) {
    if ((!isLoggedIn && hasVoted) || !isPollOpen) return;

    setSelectedOption(optionId);
    setSuccess("");
    setError("");
  }

  const showResults = Boolean(poll?.results_visible);

  return (
    <section
      id="opinion-poll"
      className="overflow-hidden bg-gray-300 px-5 py-8 text-white sm:px-8 sm:py-10 lg:px-20 lg:py-11"
    >
      <div className="mx-auto max-w-6xl rounded-4xl bg-[#061B27] p-6 sm:p-8">

        {/* Header */}
        <motion.div
          variants={revealVariants}
          {...motionSettings}
          className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-6 w-6 shrink-0 text-white"
              aria-hidden="true"
            >
              <ellipse cx="10" cy="5" rx="7" ry="3" />
              <path d="M3 5v12c0 1.7 3.1 3 7 3" />
              <path d="M17 5v7M3 9c0 1.7 3.1 3 7 3M3 13c0 1.7 3.1 3 7 3M3 17c0 1.7 3.1 3 7 3" />
              <rect x="15" y="14" width="7" height="7" rx="1.5" />
              <path d="M17 14v-1a1.5 1.5 0 0 1 3 0v1" />
            </svg>

            <span>
              {poll
                ? formatClosingDate(poll.closes_at)
                : " Opinion Poll"}
            </span>
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 text-sm text-[#B8C2C9]" role="status">
            Loading the latest opinion poll...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <p
            className="mt-6 text-sm leading-6 text-red-300"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* No poll available */}
        {!loading && !error && !poll && (
          <p className="mt-7 text-sm leading-6 text-[#B8C2C9]">
            There is currently no opinion poll available. Please check back later.
          </p>
        )}

        {/* Poll content */}
        {!loading && poll && (
          <>
            {/* Poll introduction */}
            <motion.div
              variants={revealVariants}
              {...motionSettings}
              className="mt-7 max-w-180"
            >
              <h3 className="text-xl font-bold leading-snug tracking-[-0.02em] sm:text-2xl">
                {poll.question}
              </h3>

              {poll.description && (
                <p className="mt-3 text-sm leading-6 text-[#B8C2C9] sm:text-base">
                  {poll.description}
                </p>
              )}
            </motion.div>

            {/* Poll form */}
            <form onSubmit={handleSubmit} className="mt-6">
              {poll.requires_state && (
              <div className="mb-6 max-w-190">
                <label
                  htmlFor="poll-state"
                  className="mb-2 block text-sm font-medium text-[#F3F5F6]"
                >
                  State of Residence <span className="text-red-400">*</span>
                </label>

                <select
                  id="poll-state"
                  value={selectedState}
                  onChange={(event) => setSelectedState(event.target.value)}
                  required
                  disabled={
                    !isPollOpen ||
                    submitting ||
                    isStateLocked ||
                    (!isLoggedIn && hasVoted)
                  }
                  className="w-full rounded-xl border border-white/20 bg-[#102D3A] px-4 py-3 text-sm text-white outline-none transition focus:border-[#77D69A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Select your state</option>

                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            )}
              <fieldset
                disabled={
                  !isPollOpen ||
                  (!isLoggedIn && hasVoted) ||
                  submitting ||
                  (!isLoggedIn && !poll.allow_guest_votes)
                }
              >
                <legend className="sr-only">
                  Select your preferred poll option
                </legend>

                <motion.div
                  variants={staggerContainer}
                  initial={shouldReduceMotion ? false : "hidden"}
                  whileInView="visible"
                  viewport={motionSettings.viewport}
                  className="grid max-w-190 grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2 sm:gap-x-12"
                >
                  {poll.options?.map((option) => (
                    <motion.label
                      key={option.id}
                      variants={pollOptionVariants}
                      whileHover={
                        shouldReduceMotion || !isPollOpen || hasVoted
                          ? undefined
                          : { x: 4 }
                      }
                      className={`flex min-h-6 items-center gap-4 text-sm text-[#F3F5F6] transition-colors ${
                        isPollOpen && !hasVoted
                          ? "cursor-pointer hover:text-white"
                          : "cursor-default"
                      }`}
                    >
                      <input
                        type="radio"
                        name="economy-priority"
                        value={option.id}
                        checked={selectedOption === option.id}
                        onChange={() => handleOptionChange(option.id)}
                        className="h-5.25 w-5.25 shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-[#687782] bg-transparent transition checked:border-[#1F7A3F] checked:bg-[#24834F] checked:shadow-[inset_0_0_0_5px_#061B27] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3CA66B] disabled:cursor-not-allowed"
                      />

                      <span>{option.text}</span>
                    </motion.label>
                  ))}
                </motion.div>
              </fieldset>
              {/* Guest CAPTCHA */}
              {!isLoggedIn &&
                isPollOpen &&
                !hasVoted &&
                poll.allow_guest_votes && (
                  <div className="mt-6">
                    <p className="mb-3 text-sm text-[#B8C2C9]">
                      Complete this verification before submitting your vote.
                    </p>

                    <Turnstile
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken("")}
                      onError={() => setCaptchaToken("")}
                    />
                  </div>
              )}

              
              {/* Voting access */}
              {isPollOpen && (!hasVoted || isLoggedIn) && (
                isLoggedIn ? (
                  <motion.button
                    type="submit"
                    disabled={!selectedOption || submitting}
                    whileHover={
                      shouldReduceMotion || !selectedOption || submitting
                        ? undefined
                        : { scale: 1.03 }
                    }
                    whileTap={
                      shouldReduceMotion || !selectedOption || submitting
                        ? undefined
                        : { scale: 0.97 }
                    }
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="mt-6 inline-flex min-h-12 items-center justify-center gap-4 rounded-full bg-white px-4 py-3 text-sm font-medium text-[#1F7A3F] transition hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>
                      {submitting
                      ? "Submitting..."
                      : hasVoted
                        ? "Update Vote"
                        : "Submit Feedback"}
                    </span>
                  </motion.button>
                ) : poll.allow_guest_votes ? (
                  <button
                    type="submit"
                    disabled={!selectedOption || !captchaToken || submitting}
                    className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#1F7A3F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176331] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Vote"}
                  </button>
                ) : (
                  <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
                    <h4 className="text-sm font-semibold text-white">
                      Want to have your say?
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-[#B8C2C9]">
                      Log in to your CivicIntel account to participate in this
                      opinion poll and share your perspective.
                    </p>

                    <a
                      href="/login"
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1F7A3F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#176331]"
                    >
                      Log In to Vote
                    </a>
                  </div>
                )
              )}


              
              {/* Already voted */}
              {hasVoted && isPollOpen && (
                <div className="mt-5">
                  <p className="text-sm text-[#77D69A]">
                    You have already submitted your vote.
                  </p>

                  {!isLoggedIn && (
                    <p className="mt-3 text-sm leading-6 text-[#B8C2C9]">
                      Sign up to change your vote and keep a record.
                      <a
                        href="/signup"
                        className="ml-1 font-semibold text-[#77D69A] underline underline-offset-4 hover:text-white"
                      >
                        Create an account
                      </a>
                    </p>
                  )}
                </div>
              )}


              {/* Closed poll */}
              {!isPollOpen && (
                <p className="mt-5 text-sm text-[#B8C2C9]">
                  This poll is now closed. Voting is no longer available.
                </p>
              )}

              {/* Submission confirmation */}
              {success && (
                <motion.p
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  role="status"
                  aria-live="polite"
                  className="mt-4 text-sm leading-6 text-[#77D69A]"
                >
                  {success}
                </motion.p>
              )}

              
              {/* Poll results */}
              {showResults && (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-white">
                      Poll Results
                    </h4>

                    <span className="text-xs text-[#B8C2C9]">
                      {Number(poll.total_votes ?? 0) +
                        Number(poll.guest_total_votes ?? 0)} total votes
                    </span>
                  </div>

                  <div className="mt-5 space-y-5">
                    {poll.options?.map((option) => {
                      const totalOptionVotes =
                        Number(option.votes ?? 0) +
                        Number(option.guest_votes ?? 0);

                      const totalVotes =
                        Number(poll.total_votes ?? 0) +
                        Number(poll.guest_total_votes ?? 0);

                      const percentage =
                        totalVotes > 0
                          ? (totalOptionVotes / totalVotes) * 100
                          : 0;

                      return (
                        <div key={option.id}>
                          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                            <span className="text-[#F3F5F6]">
                              {option.text}
                            </span>

                            <span className="shrink-0 font-semibold text-[#77D69A]">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-[#24834F] transition-all duration-500"
                              style={{
                                width: `${Math.min(100, Math.max(0, percentage))}%`,
                              }}
                            />
                          </div>

                          <p className="mt-1 text-xs text-[#B8C2C9]">
                            {totalOptionVotes} votes
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </form>
          </>
        )}

        {/* Privacy notice */}
        <motion.div
          variants={revealVariants}
          {...motionSettings}
          className="mt-6 flex items-start gap-3 text-xs leading-5 text-[#B8C2C9] sm:mt-7 sm:items-center sm:text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 shrink-0"
            aria-hidden="true"
          >
            <path d="M14 18a2 2 0 0 0-4 0" />
            <path d="m19 11-2.11-6.657a2 2 0 0 0-2.752-1.148l-1.276.61A2 2 0 0 1 12 4H8.5a2 2 0 0 0-1.925 1.456L5 11" />
            <path d="M2 11h20" />
            <circle cx="17" cy="18" r="3" />
            <circle cx="7" cy="18" r="3" />
          </svg>

          <p>
            Your response has been received. Results are displayed when the poll closes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default OpinionPoll;
