
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import civicIntelLogo from "../assets/signup.logo.png";

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const { verifyEmail, resendVerification } = useAuth();

  const email = location.state?.email || "";
  const destination = location.state?.from;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (event) => {
    event.preventDefault();

    if (submitting) return;

    if (!email) {
      setError("Email address is missing. Please sign up again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the six-digit verification code.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await verifyEmail(email, otp);

      navigate("/login", {
        replace: true,
        state: {
          from: destination,
          message: "Your email has been verified successfully. You can now log in.",
        },
      });
    } catch (err) {
      setError(
        err.message || "Verification failed. Please check your code."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resending || !email) return;

    setResending(true);
    setError("");
    setMessage("");

    try {
      const result = await resendVerification(email);

      setMessage(
        result?.message || "If your account requires verification, a new code has been sent."
      );
    } catch (err) {
      setError(
        err.message || "Unable to resend the verification code."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#E7ECEF] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl sm:p-10">
        <div className="mb-8 flex justify-center">
          <Link to="/" aria-label="CivicIntel home">
            <img
              src={civicIntelLogo}
              alt="CivicIntel"
              className="h-16 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#1F7A3F]/10 text-[#1F7A3F]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-8 w-8"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[#0B3C5D]">
            Verify Your Email
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            We've sent a six-digit verification code to:
          </p>

          <p className="mt-1 break-all font-semibold text-[#1F7A3F]">
            {email || "Email address unavailable"}
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="otp"
              className="mb-2 block text-xl font-medium text-gray-800"
            >
              Verification Code
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              placeholder="Enter 6-digit code"
              className="w-full rounded-xl border border-gray-300 px-4 py-4 text-center text-sm font-semibold tracking-[0.5em] text-[#0B3C5D] outline-none focus:border-[#1F7A3F] focus:ring-2 focus:ring-[#1F7A3F]/15"
              required
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || otp.length !== 6 || !email}
            className="w-full rounded-full bg-[#1F7A3F] px-5 py-3 font-medium text-white transition hover:bg-[#176331] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="mt-7 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !email}
            className="mt-2 font-semibold text-[#1F7A3F] hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend verification code"}
          </button>
        </div>

        <p className="mt-7 text-center text-sm text-gray-500">
          <Link to="/login" className="font-medium text-[#0B3C5D] hover:underline">
            Back to Login
          </Link>
        </p>
      </section>
    </main>
  );
}

export default VerifyEmail;