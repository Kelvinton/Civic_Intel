
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import civicIntelLogo from "../assets/signup.logo.png";

const initialLogin = {
  email: "",
  password: "",
  remember: false,
};

const initialSignup = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
  state: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
};

function EyeIcon({ visible }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={
          visible
            ? "M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9 7-.2 1.2-1.3 3-3.2 4.5M6.2 6.2C3.9 7.8 2.3 10 2 12c.5 2.5 4 7 10 7 1 0 2-.2 2.9-.5"
            : "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10-3a3 3 0 100 6 3 3 0 000-6z"
        }
      />
    </svg>
  );
}

function AuthInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = true,
  showPasswordToggle = false,
  visible,
  onToggleVisibility,
  autoComplete,
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-black"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPasswordToggle ? (visible ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`w-full rounded-full border bg-transparent px-4 py-3
            text-sm text-gray-800 outline-none transition-all duration-200
            placeholder:text-gray-500 focus:border-[#1F7A3F]
            focus:ring-2 focus:ring-[#1F7A3F]/15
            ${showPasswordToggle ? "pr-12" : ""}
            ${error ? "border-red-500" : "border-[#A5AAAD]"}`}
        />

        {showPasswordToggle && (
          <button
            type="button"
            onClick={onToggleVisibility}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 -translate-y-1/2
              text-gray-800 transition-colors hover:text-[#1F7A3F]"
          >
            <EyeIcon visible={visible} />
          </button>
        )}
      </div>

      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function AuthPage({ mode = "login", isLoggedIn, onLogin, onSignup }) {
  const location = useLocation();
  const navigate = useNavigate();

  
  
  const handleBack = () => {
    // Return to the actual page the visitor came from
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };



  const isSignup = mode === "signup" || location.pathname === "/signup";

  const [login, setLogin] = useState(initialLogin);
  const [signup, setSignup] = useState(initialSignup);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const values = isSignup ? signup : login;

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    if (isSignup) {
      setSignup((previous) => ({ ...previous, [name]: nextValue }));
    } else {
      setLogin((previous) => ({ ...previous, [name]: nextValue }));
    }

    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (isSignup) {
      if (!signup.firstName.trim()) {
        nextErrors.firstName = "Enter your first name.";
      }

      if (!signup.lastName.trim()) {
        nextErrors.lastName = "Enter your last name.";
      }

      if (!signup.phone.trim()) {
        nextErrors.phone = "Enter your phone number.";
      } else if (!/^[+\d][\d\s()-]{6,19}$/.test(signup.phone.trim())) {
        nextErrors.phone = "Enter a valid phone number.";
      }

      if (!signup.address.trim()) {
        nextErrors.address = "Enter your address.";
      }

      if (!signup.state) {
        nextErrors.state = "Select your state.";
      }

      if (signup.password.length < 8) {
        nextErrors.password = "Use at least 8 characters.";
      }

      if (signup.password !== signup.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }

      if (!signup.agreeToTerms) {
        nextErrors.agreeToTerms = "Please accept the terms to continue.";
      }
    }

    if (!values.email.trim()) {
      nextErrors.email = "Enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!values.password) {
      nextErrors.password = "Enter your password.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting || !validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      if (isSignup) {
        
        const result = await onSignup({
          firstName: signup.firstName.trim(),
          lastName: signup.lastName.trim(),
          phone: signup.phone.trim(),
          email: signup.email.trim(),
          address: signup.address.trim(),
          state: signup.state,
          password: signup.password,
          confirmPassword: signup.confirmPassword,
          termsAccepted: signup.agreeToTerms,
        });


        if (result?.user) {
          navigate(location.state?.from?.pathname || "/", {
            replace: true,
          });
        } else {
          navigate("/login", {
            replace: true,
            state: {
              message:
                result?.message ||
                "Your registration request was submitted. Please log in or follow any verification instructions.",
            },
          });
        }
      } else {
        await onLogin({
          email: login.email.trim(),
          password: login.password,
          remember: login.remember,
        });

        const destination = location.state?.from;

        navigate(destination?.pathname || "/", {
          replace: true,
          state: destination?.state,
        });
      }
    } catch (error) {
      setErrors({
        form:
          error.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };


  if (isLoggedIn) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#E7ECEF] px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">You're signed in</h1>
          <p className="mt-3 text-gray-600">
            Welcome to CivicIntel.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-[#1F7A3F]
              px-6 py-3 text-white transition hover:bg-[#176331]"
          >
            Explore CivicIntel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#E7ECEF] p-4 sm:p-6 lg:p-8">
        <div className="grid min-h-175 w-full max-w-5xl overflow-hidden  bg-[#E7ECEF] shadow-xl lg:min-h-152.5 lg:grid-cols-[45.15%_54.85%]">
            {/* Left branding panel */}
            <aside className="relative hidden overflow-hidden bg-[#0B3C5D] px-10 text-white lg:flex lg:flex-col lg:pt-30 text-center ">
                <div
                aria-hidden="true"
                className="absolute -right-2 -top-35 h-48 w-38
                    rounded-full bg-[#638399]/90"
                />
                <div
                aria-hidden="true"
                className="absolute -bottom-38 -left-3 h-48 w-40
                    rounded-full bg-[#638399]/90"
                />

                <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center ">
                  <Link to="/" aria-label="CivicIntel home">
                      <img
                      src={civicIntelLogo}
                      alt="CivicIntel"
                      className="h-20 w-auto max-w-28.5  object-contain"
                      />
                  </Link>

                  <p className="text-center text-base leading-6 text-white/90 mt-5">
                      A public data platform for health and education indicators.
                  </p>

                  <div className="my-12 w-full border-t border-dashed border-white/50" />

                  <h2 className="mb-3 text-center text-base font-semibold">
                      WHY CREATE AN ACCOUNT?
                  </h2>

                  <ul className=" list-disc space-y-2 text-center text-base leading-6 text-white/90">
                    <li>Save comparisons for later</li>
                    <li>Access previous analysis</li>
                    <li>Export data (PNG, PDF, CSV)</li>
                  </ul>
                </div>
            </aside>
            
            {/* Right authentication panel */}
            <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-20">
              <div className="w-full max-w-152.5">

                {/* Back button */}
                <button
                  type="button"
                  onClick={handleBack}
                  className="mb-6 inline-flex items-center gap-2 rounded-full
                    px-4 py-2 text-sm font-medium
                    text-[#0B3C5D] transition
                    hover:border-[#1F7A3F] cursor-pointer
                    "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M19 12H5m7 7-7-7 7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Back
                </button>

                
                <header className="mb-7 text-center">
                  <h1 className="text-3xl font-bold tracking-tight text-black sm:text-[42px]">
                    {isSignup ? "Create an Account" : "Welcome Back"}
                  </h1>

                  <p className="mt-2 text-sm text-[#555B60] sm:text-base">
                    {isSignup
                      ? "Register to access the CivicIntel testing environment."
                      : "Sign in to continue to CivicIntel."}
                  </p>

                  {isSignup && (
                    <div className="mt-4 rounded-xl border border-[#1F7A3F]/30 bg-[#1F7A3F]/10 px-4 py-3 text-left text-sm text-[#176331]">
                      <p className="font-semibold">Invitation required</p>
                      <p className="mt-1">
                        Registration is available only to approved team members
                        and testers. Use the email address associated with
                        your invitation.
                      </p>
                    </div>
                  )}
                </header>


                {location.state?.message && (
                  <p
                    role="status"
                    className="mb-5 rounded-xl border border-[#1F7A3F]/30
                      bg-[#1F7A3F]/10 px-4 py-3 text-sm text-[#176331]"
                  >
                    {location.state.message}
                  </p>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    {isSignup && (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <AuthInput
                            label="First Name"
                            name="firstName"
                            value={signup.firstName}
                            onChange={updateField}
                            placeholder="John"
                            autoComplete="given-name"
                            error={errors.firstName}
                        />
                        <AuthInput
                            label="Last Name"
                            name="lastName"
                            value={signup.lastName}
                            onChange={updateField}
                            placeholder="Doe"
                            autoComplete="family-name"
                            error={errors.lastName}
                        />
                        <AuthInput
                            label="Phone number"
                            name="phone"
                            type="tel"
                            value={signup.phone}
                            onChange={updateField}
                            placeholder="08000000000"
                            autoComplete="tel"
                            error={errors.phone}
                        />
                        <AuthInput
                            label="Email Address"
                            name="email"
                            type="email"
                            value={signup.email}
                            onChange={updateField}
                            placeholder="johndoe@gmail.com"
                            autoComplete="email"
                            error={errors.email}
                        />
                        </div>

                        <AuthInput
                        label="Address"
                        name="address"
                        value={signup.address}
                        onChange={updateField}
                        placeholder="12, Macaulay Way, Ikeja, Lagos"
                        autoComplete="street-address"
                        error={errors.address}
                        />

                        <div>
                        <label htmlFor="state" className="mb-2 block text-sm font-medium">
                            State
                        </label>
                        <select
                            id="state"
                            name="state"
                            value={signup.state}
                            onChange={updateField}
                            required
                            aria-invalid={Boolean(errors.state)}
                            className="w-full rounded-full border border-[#A5AAAD]
                            bg-transparent px-4 py-3 text-sm outline-none transition
                            focus:border-[#1F7A3F] focus:ring-2 focus:ring-[#1F7A3F]/15"
                        >
                            <option value="">Select state</option>
                            {[
                            "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi",
                            "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
                            "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
                            "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
                            "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
                            "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
                            "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
                            "Yobe", "Zamfara",
                            ].map((state) => (
                            <option key={state} value={state}>
                                {state}
                            </option>
                            ))}
                        </select>
                        {errors.state && (
                            <p className="mt-1 text-xs text-red-600">{errors.state}</p>
                        )}
                        </div>
                    </>
                    )}

                    
                    {!isSignup && (
                      <AuthInput
                        label="Email Address"
                        name="email"
                        type="email"
                        value={login.email}
                        onChange={updateField}
                        placeholder="johndoe@gmail.com"
                        autoComplete="username"
                        error={errors.email}
                      />
                    )}


                    <AuthInput
                    label="Password"
                    name="password"
                    value={values.password}
                    onChange={updateField}
                    placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    error={errors.password}
                    showPasswordToggle
                    visible={showPassword}
                    onToggleVisibility={() => setShowPassword((v) => !v)}
                    />

                    {isSignup ? (
                    <>
                        <AuthInput
                        label="Confirm Password"
                        name="confirmPassword"
                        value={signup.confirmPassword}
                        onChange={updateField}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        error={errors.confirmPassword}
                        showPasswordToggle
                        visible={showConfirmPassword}
                        onToggleVisibility={() =>
                            setShowConfirmPassword((v) => !v)
                        }
                        />

                        <div>
                        <label className="flex cursor-pointer items-start gap-3 text-xs
                            leading-4 text-[#74797D]">
                            <input
                            type="checkbox"
                            name="agreeToTerms"
                            checked={signup.agreeToTerms}
                            onChange={updateField}
                            className="mt-0.5 h-5 w-5 shrink-0 accent-[#1F7A3F]"
                            />
                            <span>
                            I agree to CivicIntel's terms and acknowledge the
                            platform's data usage policies.
                            </span>
                        </label>
                        {errors.agreeToTerms && (
                            <p className="mt-1 text-xs text-red-600">
                            {errors.agreeToTerms}
                            </p>
                        )}
                        </div>
                    </>
                    ) : (
                    <div className="flex items-center justify-between gap-3 text-xs">
                        <label className="flex cursor-pointer items-center gap-3 text-[#74797D]">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={login.remember}
                            onChange={updateField}
                            className="h-5 w-5 rounded accent-[#1F7A3F]"
                        />
                        Remember me
                        </label>
                        <Link
                        to="/forgot-password"
                        className="font-medium text-[#0B3C5D] hover:text-[#1F7A3F]"
                        >
                        Forgot Password
                        </Link>
                    </div>
                    )}

                    
                    {errors.form && (
                      <div
                        role="alert"
                        aria-live="assertive"
                        className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
                      >
                        {errors.form}
                      </div>
                    )}


                    <button
                    type="submit"
                    disabled={submitting}
                    className="group flex w-full items-center justify-center gap-3
                        rounded-full bg-[#1F7A3F] px-5 py-3 text-sm font-medium
                        text-white transition-all duration-200
                        hover:bg-[#176331] hover:shadow-md
                        focus-visible:outline-none focus-visible:ring-2
                        focus-visible:ring-[#1F7A3F] focus-visible:ring-offset-2
                        disabled:cursor-not-allowed disabled:opacity-60"
                    >
                    {submitting
                        ? "Please wait..."
                        : isSignup
                        ? "Sign Up"
                        : "Log In"}

                    <span className="flex h-7.5 w-7.5 items-center
                        justify-center rounded-full bg-white text-[#0B3C5D]
                        transition-transform duration-200 group-hover:translate-x-1">
                        <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-5 w-5"
                        aria-hidden="true"
                        >
                        <path
                            d="M4.5 12h15m-7.5-7.5L19.5 12 12 19.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        </svg>
                    </span>
                    </button>
                </form>

                <p className="mt-7 text-center text-xs text-[#74797D]">
                    {isSignup ? (
                    <>
                        Already have an account?{" "}
                        <Link
                          to="/login"
                          state={location.state}
                          className="font-medium text-[#1F7A3F] hover:underline"
                        >
                          Log in.
                        </Link>
                    </>
                    ) : (
                    <>
                        Don't have an account?{" "}
                        <Link
                          to="/signup"
                          state={location.state}
                          className="font-medium text-[#1F7A3F] hover:underline"
                        >
                          Sign up.
                        </Link>
                    </>
                    )}
                </p>
                </div>
            </section>

        </div>
      

      
    </main>
  );
}

export default AuthPage;
