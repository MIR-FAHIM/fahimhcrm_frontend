import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LuMail,
  LuLock,
  LuKeyRound,
  LuEye,
  LuEyeOff,
  LuArrowLeft,
  LuArrowRight,
  LuRotateCw,
  LuCircleCheck,
  LuCircleAlert,
  LuShieldCheck,
  LuClock,
  LuPencil,
  LuCheck,
  LuX,
  LuLoaderCircle,
} from "react-icons/lu";
import {
  forgotPasswordController,
  resetPasswordController,
} from "../../../api/controller/admin_controller/user_controller";
import "./forgot_password.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const calculatePasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "Empty", levelClass: "" };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 12) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 1) return { score: 1, label: "Weak", levelClass: "weak" };
  if (score === 2) return { score: 2, label: "Fair", levelClass: "fair" };
  if (score === 3 || score === 4) return { score: 3, label: "Good", levelClass: "good" };
  return { score: 4, label: "Strong", levelClass: "strong" };
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Multi-step: 1 = Request OTP, 2 = Verify & Set Password, 3 = Success
  const [step, setStep] = useState(1);

  // Step 1: Email
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailFormatError, setEmailFormatError] = useState("");

  // Step 2: OTP (6 separate boxes)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  // Step 2: Passwords
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  // Timers
  const [resendTimer, setResendTimer] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Network & Status states
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [bannerAlert, setBannerAlert] = useState(null); // { type: "error" | "success" | "warning", message: string }
  const [fieldErrors, setFieldErrors] = useState({});

  // Real-time email validation
  const validateEmailFormat = (val) => {
    if (!val || !val.trim()) {
      return "Email address is required.";
    }
    if (!EMAIL_REGEX.test(val.trim())) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (bannerAlert) setBannerAlert(null);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (emailTouched) {
      setEmailFormatError(validateEmailFormat(val));
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailFormatError(validateEmailFormat(email));
  };

  // Step 1: Submit email to request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setEmailTouched(true);
    const err = validateEmailFormat(email);
    setEmailFormatError(err);
    if (err) return;

    setLoading(true);
    setBannerAlert(null);
    setFieldErrors({});

    try {
      const payload = { email: email.trim().toLowerCase() };
      const response = await forgotPasswordController(payload);

      const isSuccess =
        response?.status === "success" ||
        response?.status === 200 ||
        response?.success === true;

      if (isSuccess) {
        setBannerAlert({
          type: "success",
          message: response?.message || "Verification code sent! Please check your email inbox.",
        });
        setStep(2);
        setResendTimer(60);
      } else {
        setBannerAlert({
          type: "error",
          message: response?.message || "Failed to send reset code. Please try again.",
        });
      }
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      if (status === 429) {
        setBannerAlert({
          type: "warning",
          message: data?.message || "Too many reset attempts. Please wait a moment before trying again.",
        });
      } else if (status === 422) {
        setBannerAlert({
          type: "error",
          message: data?.message || "Invalid email submitted. Please check the address.",
        });
        if (data?.errors) {
          setFieldErrors(data.errors);
        }
      } else {
        setBannerAlert({
          type: "error",
          message: data?.message || "Failed to send reset code. Please check your network and try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Countdown handler
  useEffect(() => {
    let timerId;
    if (step === 2 && resendTimer > 0) {
      timerId = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [step, resendTimer]);

  // Step 2: Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    setBannerAlert(null);
    setFieldErrors({});

    try {
      const payload = { email: email.trim().toLowerCase() };
      const response = await forgotPasswordController(payload);

      const isSuccess =
        response?.status === "success" ||
        response?.status === 200 ||
        response?.success === true;

      if (isSuccess) {
        setBannerAlert({
          type: "success",
          message: response?.message || "A fresh 6-digit code has been sent to your email.",
        });
        setResendTimer(60);
        setOtp(["", "", "", "", "", ""]);
        if (otpRefs.current[0]) {
          otpRefs.current[0].focus();
        }
      } else {
        setBannerAlert({
          type: "error",
          message: response?.message || "Failed to resend code. Please try again.",
        });
      }
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      if (status === 429) {
        setBannerAlert({
          type: "warning",
          message: data?.message || "Too many requests. Please wait a few moments before requesting another code.",
        });
      } else {
        setBannerAlert({
          type: "error",
          message: data?.message || "Failed to resend verification code. Please try again.",
        });
      }
    } finally {
      setResending(false);
    }
  };

  // OTP Box inputs handler
  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const lastDigit = cleaned.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = lastDigit;
    setOtp(newOtp);

    if (bannerAlert) setBannerAlert(null);
    if (fieldErrors.otp) {
      setFieldErrors((prev) => ({ ...prev, otp: undefined }));
    }

    if (index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0 && otpRefs.current[index - 1]) {
        e.preventDefault();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpRefs.current[index - 1].focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasteData) return;

    const digits = pasteData.slice(0, 6).split("");
    const newOtp = [...otp];

    digits.forEach((digit, idx) => {
      newOtp[idx] = digit;
    });

    setOtp(newOtp);
    const nextIdx = Math.min(digits.length, 5);
    otpRefs.current[nextIdx]?.focus();
  };

  // Step 2: Submit Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setConfirmTouched(true);

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setBannerAlert({
        type: "error",
        message: "Please enter the complete 6-digit verification code.",
      });
      return;
    }

    if (password.length < 8) {
      setBannerAlert({
        type: "error",
        message: "New password must be at least 8 characters long.",
      });
      return;
    }

    if (password !== passwordConfirmation) {
      setBannerAlert({
        type: "error",
        message: "Password confirmation does not match the new password.",
      });
      return;
    }

    setLoading(true);
    setBannerAlert(null);
    setFieldErrors({});

    try {
      const payload = {
        email: email.trim().toLowerCase(),
        otp: otpCode,
        password: password,
        password_confirmation: passwordConfirmation,
      };

      const response = await resetPasswordController(payload);

      const isSuccess =
        response?.status === "success" ||
        response?.status === 200 ||
        response?.success === true;

      if (isSuccess) {
        // Never persist credentials; wipe from state immediately
        setPassword("");
        setPasswordConfirmation("");
        setOtp(["", "", "", "", "", ""]);
        setStep(3);
        setRedirectCountdown(3);
      } else {
        setBannerAlert({
          type: "error",
          message: response?.message || "Failed to reset password. Please check your code.",
        });
      }
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      if (status === 400) {
        setBannerAlert({
          type: "error",
          message: data?.message || "Invalid or expired verification code.",
        });
      } else if (status === 422) {
        setBannerAlert({
          type: "error",
          message: data?.message || "Validation failed. Please verify your inputs.",
        });
        if (data?.errors) {
          setFieldErrors(data.errors);
        }
      } else if (status === 429) {
        setBannerAlert({
          type: "warning",
          message: data?.message || "Too many password reset attempts. Please try again later.",
        });
      } else {
        setBannerAlert({
          type: "error",
          message: data?.message || "Something went wrong while resetting your password. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Auto-redirect countdown
  useEffect(() => {
    let redirectTimerId;
    if (step === 3) {
      if (redirectCountdown > 0) {
        redirectTimerId = setInterval(() => {
          setRedirectCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        navigate("/login", { replace: true });
      }
    }
    return () => {
      if (redirectTimerId) clearInterval(redirectTimerId);
    };
  }, [step, redirectCountdown, navigate]);

  const handleEditEmail = () => {
    setBannerAlert(null);
    setFieldErrors({});
    setStep(1);
  };

  const pwdStrength = calculatePasswordStrength(password);
  const passwordsMatch = Boolean(
    passwordConfirmation && password === passwordConfirmation
  );
  const passwordsMismatch = Boolean(
    confirmTouched && passwordConfirmation && password !== passwordConfirmation
  );

  return (
    <div className="fp-page-wrapper">
      {/* Ambient Glow Orbs */}
      <div className="fp-bg-glow">
        <div className="fp-glow-1" />
        <div className="fp-glow-2" />
        <div className="fp-glow-3" />
      </div>

      <div className="fp-container">
        {/* Brand Header */}
        <div className="fp-brand-header">
          <Link to="/login" className="fp-brand-link">
            <div className="fp-brand-logo">B</div>
            <span className="fp-brand-name">BrainToDo</span>
          </Link>
        </div>

        {/* Card */}
        <div className="fp-card">
          {/* Stepper Progress Bar */}
          <div className="fp-stepper">
            <div className="fp-stepper-meta">
              <span className="fp-stepper-label">
                {step === 1 && "Step 1 of 3: Verification Email"}
                {step === 2 && "Step 2 of 3: Code & New Password"}
                {step === 3 && "Step 3 of 3: Completed"}
              </span>
              <span className="fp-stepper-percent">
                {step === 1 && "33%"}
                {step === 2 && "66%"}
                {step === 3 && "100%"}
              </span>
            </div>
            <div className="fp-stepper-track">
              <div
                className="fp-stepper-bar"
                style={{
                  width: step === 1 ? "33.3%" : step === 2 ? "66.6%" : "100%",
                }}
              />
            </div>
          </div>

          {/* Alert Banner */}
          {bannerAlert && (
            <div
              className={`fp-alert ${
                bannerAlert.type === "success"
                  ? "fp-alert-success"
                  : bannerAlert.type === "warning"
                  ? "fp-alert-warning"
                  : "fp-alert-error"
              }`}
            >
              {bannerAlert.type === "success" ? (
                <LuCircleCheck className="fp-alert-icon" />
              ) : bannerAlert.type === "warning" ? (
                <LuClock className="fp-alert-icon" />
              ) : (
                <LuCircleAlert className="fp-alert-icon" />
              )}
              <div className="fp-alert-body">{bannerAlert.message}</div>
              <button
                type="button"
                onClick={() => setBannerAlert(null)}
                className="fp-alert-close"
                aria-label="Dismiss alert"
              >
                <LuX />
              </button>
            </div>
          )}

          {/* ========================================================
              STEP 1: REQUEST OTP VIA EMAIL
             ======================================================== */}
          {step === 1 && (
            <div>
              <div className="fp-header-center">
                <div className="fp-badge-icon fp-badge-blue">
                  <LuLock />
                </div>
                <h1 className="fp-title">Reset Password</h1>
                <p className="fp-subtitle">
                  Enter your verified account email to receive a 6-digit recovery code.
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="fp-form" noValidate>
                <div className="fp-field">
                  <div className="fp-label-row">
                    <label htmlFor="reset-email" className="fp-label">
                      Email Address
                    </label>
                  </div>
                  <div className="fp-input-wrapper">
                    <span className="fp-input-icon">
                      <LuMail />
                    </span>
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={handleEmailBlur}
                      disabled={loading}
                      placeholder="name@company.com"
                      autoComplete="email"
                      autoFocus
                      className={`fp-input ${
                        emailFormatError || fieldErrors.email ? "has-error" : ""
                      }`}
                    />
                  </div>
                  {(emailFormatError || fieldErrors.email) && (
                    <p className="fp-error-text">
                      <LuCircleAlert />
                      <span>
                        {emailFormatError ||
                          (Array.isArray(fieldErrors.email)
                            ? fieldErrors.email[0]
                            : fieldErrors.email)}
                      </span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim() || Boolean(emailFormatError)}
                  className="fp-submit-btn"
                >
                  {loading ? (
                    <>
                      <LuLoaderCircle className="fp-spin" />
                      <span>Sending Reset Code...</span>
                    </>
                  ) : (
                    <span>Send Reset Code</span>
                  )}
                </button>
              </form>

              <div className="fp-back-row">
                <Link to="/login" className="fp-back-link">
                  <LuArrowLeft />
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 2: VERIFY OTP & SET NEW PASSWORD
             ======================================================== */}
          {step === 2 && (
            <div>
              <div className="fp-header-center">
                <div className="fp-badge-icon fp-badge-cyan">
                  <LuKeyRound />
                </div>
                <h1 className="fp-title">Verify & Set Password</h1>
                <p className="fp-subtitle">
                  Enter the 6-digit code sent to your email.
                </p>

                {/* Recipient Email Chip */}
                <div className="fp-recipient-chip">
                  <LuMail style={{ color: "#0284C7" }} />
                  <span className="fp-recipient-email">{email}</span>
                  <button
                    type="button"
                    onClick={handleEditEmail}
                    className="fp-recipient-edit-btn"
                    title="Change email address"
                  >
                    <LuPencil style={{ fontSize: "11px" }} />
                    <span>Change</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleResetPassword} className="fp-form" noValidate>
                {/* 6-Digit OTP Box Grid */}
                <div className="fp-field">
                  <div className="fp-label-row">
                    <label className="fp-label">6-Digit Code</label>
                    <div className="fp-resend-row">
                      {resendTimer > 0 ? (
                        <span className="fp-resend-countdown">
                          <LuClock style={{ color: "#0284C7" }} />
                          <span>Resend in {resendTimer}s</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={resending}
                          className="fp-resend-btn"
                        >
                          <LuRotateCw className={resending ? "fp-spin" : ""} />
                          <span>{resending ? "Resending..." : "Resend Code"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="fp-otp-grid" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        disabled={loading}
                        autoFocus={idx === 0}
                        aria-label={`OTP Digit ${idx + 1}`}
                        className={`fp-otp-box ${digit ? "is-filled" : ""}`}
                      />
                    ))}
                  </div>

                  {fieldErrors.otp && (
                    <p className="fp-error-text">
                      <LuCircleAlert />
                      <span>
                        {Array.isArray(fieldErrors.otp)
                          ? fieldErrors.otp[0]
                          : fieldErrors.otp}
                      </span>
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="fp-field">
                  <div className="fp-label-row">
                    <label htmlFor="new-password" className="fp-label">
                      New Password
                    </label>
                  </div>
                  <div className="fp-input-wrapper">
                    <span className="fp-input-icon">
                      <LuLock />
                    </span>
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (bannerAlert) setBannerAlert(null);
                        if (fieldErrors.password) {
                          setFieldErrors((prev) => ({ ...prev, password: undefined }));
                        }
                      }}
                      disabled={loading}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      className={`fp-input ${fieldErrors.password ? "has-error" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="fp-input-toggle"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <LuEyeOff /> : <LuEye />}
                    </button>
                  </div>

                  {fieldErrors.password && (
                    <p className="fp-error-text">
                      <LuCircleAlert />
                      <span>
                        {Array.isArray(fieldErrors.password)
                          ? fieldErrors.password[0]
                          : fieldErrors.password}
                      </span>
                    </p>
                  )}

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="fp-strength">
                      <div className="fp-strength-meta">
                        <span>Password strength:</span>
                        <span
                          className={`fp-strength-label ${
                            pwdStrength.score === 1
                              ? "text-rose-500"
                              : pwdStrength.score === 2
                              ? "text-amber-500"
                              : pwdStrength.score === 3
                              ? "text-blue-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {pwdStrength.label}
                        </span>
                      </div>
                      <div className="fp-strength-bars">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`fp-strength-bar ${
                              pwdStrength.score >= level ? pwdStrength.levelClass : ""
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="fp-field">
                  <div className="fp-label-row">
                    <label htmlFor="confirm-password" className="fp-label">
                      Confirm New Password
                    </label>
                  </div>
                  <div className="fp-input-wrapper">
                    <span className="fp-input-icon">
                      <LuLock />
                    </span>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordConfirmation}
                      onChange={(e) => {
                        setPasswordConfirmation(e.target.value);
                        if (bannerAlert) setBannerAlert(null);
                        if (fieldErrors.password_confirmation) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            password_confirmation: undefined,
                          }));
                        }
                      }}
                      onBlur={() => setConfirmTouched(true)}
                      disabled={loading}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      className={`fp-input ${
                        passwordsMismatch || fieldErrors.password_confirmation
                          ? "has-error"
                          : passwordsMatch
                          ? "is-valid"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="fp-input-toggle"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <LuEyeOff /> : <LuEye />}
                    </button>
                  </div>

                  {passwordConfirmation && (
                    <div className="fp-match-indicator">
                      {passwordsMatch ? (
                        <span className="fp-match-success">
                          <LuCheck /> Passwords match
                        </span>
                      ) : (
                        <span className="fp-match-error">
                          <LuX /> Passwords do not match
                        </span>
                      )}
                    </div>
                  )}

                  {fieldErrors.password_confirmation && (
                    <p className="fp-error-text">
                      <LuCircleAlert />
                      <span>
                        {Array.isArray(fieldErrors.password_confirmation)
                          ? fieldErrors.password_confirmation[0]
                          : fieldErrors.password_confirmation}
                      </span>
                    </p>
                  )}
                </div>

                {/* Requirement Checklist */}
                <div className="fp-checklist">
                  <div
                    className={`fp-check-item ${password.length >= 8 ? "passed" : ""}`}
                  >
                    <span className="fp-check-bullet">
                      {password.length >= 8 ? <LuCheck /> : "•"}
                    </span>
                    <span>At least 8 characters long</span>
                  </div>
                  <div
                    className={`fp-check-item ${
                      otp.join("").length === 6 ? "passed" : ""
                    }`}
                  >
                    <span className="fp-check-bullet">
                      {otp.join("").length === 6 ? <LuCheck /> : "•"}
                    </span>
                    <span>6-digit verification code entered</span>
                  </div>
                </div>

                {/* Submit Reset Button */}
                <button
                  type="submit"
                  disabled={
                    loading ||
                    otp.join("").length !== 6 ||
                    password.length < 8 ||
                    password !== passwordConfirmation
                  }
                  className="fp-submit-btn"
                >
                  {loading ? (
                    <>
                      <LuLoaderCircle className="fp-spin" />
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    <>
                      <LuShieldCheck />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </form>

              <div className="fp-back-row">
                <button
                  type="button"
                  onClick={handleEditEmail}
                  className="fp-back-link"
                >
                  <LuArrowLeft />
                  <span>Use a different email address</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 3: SUCCESS STATE
             ======================================================== */}
          {step === 3 && (
            <div className="fp-success-container">
              {/* Animated Green Checkmark Badge */}
              <div className="fp-success-icon-wrap">
                <div className="fp-pulse-ring" />
                <div className="fp-success-icon">
                  <LuCheck />
                </div>
              </div>

              <h2 className="fp-title">Password Reset Successful!</h2>

              <p className="fp-subtitle" style={{ maxWidth: "340px", margin: "8px auto 0 auto" }}>
                Your password has been changed securely. You can now use your new password to sign in.
              </p>

              {/* Auto Redirect Countdown Box */}
              <div className="fp-countdown-box">
                <LuClock style={{ color: "#10B981" }} />
                <span>
                  Redirecting to login in{" "}
                  <strong className="fp-countdown-number">
                    {redirectCountdown}s
                  </strong>
                  ...
                </span>
              </div>

              {/* Immediate Login Button */}
              <button
                type="button"
                onClick={() => navigate("/login", { replace: true })}
                className="fp-submit-btn success"
                style={{ marginTop: "16px" }}
              >
                <span>Login Now</span>
                <LuArrowRight />
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="fp-footer-note">
          Need help? Contact your system administrator or support team.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
