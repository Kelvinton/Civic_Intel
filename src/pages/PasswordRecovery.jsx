
import { useState } from "react";
import { apiRequest } from "../api/api.js";

function PasswordRecovery({ onBackToLogin }) {
  const [step, setStep] = useState("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      setEmail(normalizedEmail);
      setMessage(
        "If the email is registered, you should receive a password reset code. Check your inbox and spam folder."
      );
      setStep("reset");
    } catch (err) {
      setError(
        err?.message ||
          "We could not process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!otp.trim()) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      setStep("success");
      setMessage(
        "Your password has been reset successfully. You can now log in with your new password."
      );

      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err?.message ||
          "Password reset failed. Check your OTP and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;

    setStep("email");
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");

    onBackToLogin?.();
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-recovery-title"
        className="relative my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          aria-label="Close password recovery"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          &times;
        </button>

        {/* Modal heading */}
        <div className="mb-6 pr-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-700">
            CivicIntel account
          </p>

          <h2
            id="password-recovery-title"
            className="text-2xl font-bold text-slate-900"
          >
            {step === "email" && "Forgot your password?"}
            {step === "reset" && "Reset your password"}
            {step === "success" && "Password updated"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {step === "email" &&
              "Enter the email address linked to your account. We will help you reset your password."}

            {step === "reset" &&
              "Enter the reset code sent to your email and choose a new password."}

            {step === "success" &&
              "Your password reset process is complete."}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Informational or success message */}
        {message && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800"
          >
            {message}
          </div>
        )}

        {/* Step 1: Request reset code */}
        {step === "email" && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <label
                htmlFor="recovery-email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <input
                id="recovery-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-700 focus:ring-2 focus:ring-green-700/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-green-800 px-4 py-3 font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending request..." : "Send reset code"}
            </button>

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="w-full py-2 text-sm font-medium text-slate-600 transition hover:text-green-800 disabled:opacity-50"
            >
              Back to login
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP and new password */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label
                htmlFor="recovery-otp"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Reset code (OTP)
              </label>

              <input
                id="recovery-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter your reset code"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-700 focus:ring-2 focus:ring-green-700/20"
              />
            </div>

            <div>
              <label
                htmlFor="recovery-new-password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                New password
              </label>

              <input
                id="recovery-new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-700 focus:ring-2 focus:ring-green-700/20"
              />
            </div>

            <div>
              <label
                htmlFor="recovery-confirm-password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirm new password
              </label>

              <input
                id="recovery-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Enter your new password again"
                minLength={8}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-700 focus:ring-2 focus:ring-green-700/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-green-800 px-4 py-3 font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating password..." : "Reset password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setMessage("");
                setStep("email");
              }}
              disabled={loading}
              className="w-full py-2 text-sm font-medium text-slate-600 transition hover:text-green-800 disabled:opacity-50"
            >
              Use a different email
            </button>
          </form>
        )}

        {/* Step 3: Reset completed */}
        {step === "success" && (
          <div className="space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl text-green-800">
              &#10003;
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-lg bg-green-800 px-4 py-3 font-semibold text-white transition hover:bg-green-900"
            >
              Return to login
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default PasswordRecovery;
