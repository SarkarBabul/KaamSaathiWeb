import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Building2, Calendar, Eye, EyeOff, Home, Lock, Phone, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { getRedirectRoute } from "@/app-desktop/auth/AuthContext";
import { loginWithPassword, sendLoginOtp, verifyLoginOtp, forgetPassword } from "@/app-desktop/api/auth.api";
import { ApiError } from "@/app-desktop/api/httpClient";
import { cn } from "@/lib/utils";

const MOBILE_PATTERN = /^[6-9][0-9]{9}$/;

type LoginMode = "password" | "otp" | "forget";

// Types are hand-written rather than derived via z.infer: the installed
// zod/typescript combination in this project resolves z.infer on a plain
// z.object to all-optional fields (a known zod/TS type-inference mismatch),
// so schemas below are used for runtime validation only, decoupled from
// the compile-time shapes.
interface PasswordFormValues {
  mobileNumber: string;
  password: string;
}
const passwordSchema = z.object({
  mobileNumber: z.string().regex(MOBILE_PATTERN, "Enter a valid 10-digit mobile number"),
  password: z.string().min(1, "Password is required"),
});

interface OtpRequestValues {
  mobileNumber: string;
}
const otpRequestSchema = z.object({
  mobileNumber: z.string().regex(MOBILE_PATTERN, "Enter a valid 10-digit mobile number"),
});

interface OtpVerifyValues {
  otpCode: string;
}
const otpVerifySchema = z.object({
  otpCode: z.string().min(1, "Enter the OTP"),
});

interface ForgetFormValues {
  mobileNumber: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}
// Fixed vs. Angular: the original cross-field validator was wired to keys
// ('password'/'confrmPassword') that didn't match the actual form controls
// ('ppassword'/'cconfrmPassword'), so it silently never fired. Field names
// here are the source of truth, and the refine below actually runs.
const forgetSchema = z
  .object({
    mobileNumber: z.string().regex(MOBILE_PATTERN, "Enter a valid 10-digit mobile number"),
    otpCode: z.string().min(1, "Enter the OTP"),
    newPassword: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Recreates the Angular source's login.component (split hero + white card)
// visually: left brand panel with the three feature blocks, right rounded
// card with the four modes (password / otp / forget) exactly as before.
// Only presentation changed — every handler, schema, and API call below is
// unchanged from the previous implementation.
const FEATURES = [
  { icon: Users, label: "Attendance Tracking", tint: "bg-blue-100 text-blue-600" },
  { icon: Building2, label: "Site Management", tint: "bg-emerald-100 text-emerald-600" },
  { icon: Calendar, label: "Reports", tint: "bg-rose-100 text-rose-600" },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mb-2 ml-1 text-left text-xs text-red-500">{message}</p>;
}

export default function Login() {
  const [mode, setMode] = useState<LoginMode>("password");
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [otpMobile, setOtpMobile] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema) as Resolver<PasswordFormValues>,
  });
  const otpRequestForm = useForm<OtpRequestValues>({
    resolver: zodResolver(otpRequestSchema) as Resolver<OtpRequestValues>,
  });
  const otpVerifyForm = useForm<OtpVerifyValues>({
    resolver: zodResolver(otpVerifySchema) as Resolver<OtpVerifyValues>,
  });
  const forgetForm = useForm<ForgetFormValues>({
    resolver: zodResolver(forgetSchema) as Resolver<ForgetFormValues>,
  });

  const redirectAfterLogin = (role: string) => {
    navigate(getRedirectRoute(role), { replace: true });
  };

  // Switching modes clears the in-progress OTP step and any stale values
  // from the previous mode's form, so re-entering OTP mode always starts
  // at "send OTP" rather than resuming a stale "verify OTP" step for a
  // different mobile number.
  const switchMode = (next: LoginMode) => {
    setOtpToken(null);
    setOtpMobile("");
    otpRequestForm.reset();
    otpVerifyForm.reset();
    forgetForm.reset();
    setMode(next);
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setSubmitting(true);
    try {
      const res = await loginWithPassword(values);
      if (res.status === "SUCCESS" && res.statusCode === "LOGIN_200" && res.response) {
        const session = login(res.response);
        redirectAfterLogin(session.role);
      } else {
        toast.error(res.message ?? "Login failed");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onSendOtp = async (values: OtpRequestValues) => {
    setSubmitting(true);
    try {
      const res = await sendLoginOtp(values.mobileNumber);
      const token = res.otpToken ?? res.data?.otpToken;
      if (res.status === "SUCCESS" && token) {
        setOtpToken(token);
        setOtpMobile(values.mobileNumber);
        toast.success("OTP sent");
      } else {
        toast.error(res.message ?? "Could not send OTP");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not send OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyOtp = async (values: OtpVerifyValues) => {
    if (!otpToken) return;
    setSubmitting(true);
    try {
      const res = await verifyLoginOtp({ mobileNumber: otpMobile, otpCode: values.otpCode, otpToken });
      if (res.status === "SUCCESS" && res.response) {
        // Fixed vs. Angular: OTP success previously navigated via a
        // hardcoded admin/non-admin branch instead of getRedirectRoute,
        // misrouting ENTERPRISE/super_admin users. Now uses the same
        // redirect logic as password login.
        const session = login(res.response);
        redirectAfterLogin(session.role);
      } else {
        toast.error(res.message ?? "Invalid OTP");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Invalid OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const onForgetSubmit = async (values: ForgetFormValues) => {
    setSubmitting(true);
    try {
      const res = await forgetPassword(values);
      if (res.status === "SUCCESS") {
        toast.success("Password updated — please log in");
        switchMode("password");
      } else {
        toast.error(res.message ?? "Could not reset password");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex w-full flex-1 flex-col overflow-x-hidden lg:flex-row"
      style={{
        background:
          "radial-gradient(circle at 15% 20%, rgba(79,70,229,0.06), transparent 40%), radial-gradient(circle at 85% 80%, rgba(35,157,76,0.07), transparent 45%), #f7f8fb",
      }}
    >
      {/* LEFT — branding */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:w-[58%] lg:px-10">
        <div className="max-w-[560px] text-center">
          <div className="mb-8 flex justify-center gap-5">
            <div className="flex h-[62px] w-[62px] items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
              <Building2 className="h-7 w-7" />
            </div>
            <div className="flex h-[62px] w-[62px] items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
              <Users className="h-7 w-7" />
            </div>
            <div className="flex h-[62px] w-[62px] items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
              <Calendar className="h-7 w-7" />
            </div>
          </div>

          <h1 className="mb-4 text-[34px] font-bold tracking-tight text-[#4f46e5]">Worker Management System</h1>
          <p className="mb-9 text-[15px] leading-relaxed text-[#667085]">
            Streamline your workforce operations with our comprehensive management platform. Track attendance,
            manage payments, and monitor site progress all in one place.
          </p>

          <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, label, tint }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-[14px] border border-[#f0f1f5] bg-white p-4 shadow-[0_4px_14px_rgba(0,0,0,0.05)]"
              >
                <span className={cn("flex shrink-0 items-center justify-center rounded-lg p-2", tint)}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[13.5px] font-semibold text-[#344054]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — login card */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 lg:w-[42%] lg:px-6">
        <div
          className="w-full max-w-[440px] rounded-3xl bg-white p-9 text-center"
          style={{
            boxShadow: "0 30px 60px rgba(15,23,42,0.08), 0 8px 24px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.03)",
          }}
        >
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[0_8px_20px_rgba(35,157,76,0.3)]"
            style={{ background: "linear-gradient(135deg, #2ba85b, #1c7a3d)" }}
          >
            <Home className="h-6 w-6" />
          </div>

          <h2 className="mb-1.5 text-2xl font-bold tracking-tight text-[#101828]">Welcome Back</h2>

          {mode === "password" && (
            <>
              <p className="mb-7 text-sm text-[#98a2b3]">Sign in to access your dashboard</p>
              <form className="text-left" onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <label className="mb-1.5 block text-[12.5px] font-semibold tracking-wide text-[#344054]">
                  Username
                </label>
                <div className="mb-2 flex items-center rounded-xl border-[1.5px] border-[#e4e7ec] bg-[#f9fafb] px-3.5 py-3 transition-colors focus-within:border-[#3bbf6b] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(35,157,76,0.1)]">
                  <User className="mr-2.5 h-[17px] w-[17px] shrink-0 text-[#98a2b3]" />
                  <input
                    id="mobileNumber"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter your username"
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#101828] outline-none placeholder:font-normal placeholder:text-[#98a2b3]"
                    {...passwordForm.register("mobileNumber")}
                  />
                </div>
                <FieldError message={passwordForm.formState.errors.mobileNumber?.message} />

                <label className="mb-1.5 block text-[12.5px] font-semibold tracking-wide text-[#344054]">
                  Password
                </label>
                <div className="relative mb-2 flex items-center rounded-xl border-[1.5px] border-[#e4e7ec] bg-[#f9fafb] px-3.5 py-3 transition-colors focus-within:border-[#3bbf6b] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(35,157,76,0.1)]">
                  <Lock className="mr-2.5 h-[17px] w-[17px] shrink-0 text-[#98a2b3]" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="min-w-0 flex-1 bg-transparent pr-6 text-sm font-medium text-[#101828] outline-none placeholder:font-normal placeholder:text-[#98a2b3]"
                    {...passwordForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 text-[#98a2b3] hover:text-[#667085]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={passwordForm.formState.errors.password?.message} />

                <div className="mb-5 mt-3 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    className="font-semibold text-[#101828] hover:text-[#3bbf6b]"
                    onClick={() => switchMode("otp")}
                  >
                    Login With OTP?
                  </button>
                  <button
                    type="button"
                    className="font-semibold text-[#101828] hover:text-[#3bbf6b]"
                    onClick={() => switchMode("forget")}
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl py-6 text-[15px] font-semibold shadow-[0_8px_20px_rgba(35,157,76,0.28)]"
                  style={{ background: "linear-gradient(135deg, #2ba85b, #1c7a3d)" }}
                >
                  {submitting ? "Loading..." : "Sign In"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled
                  title="Self-service enterprise sign-up isn't wired to a route yet"
                  className="mt-3 w-full cursor-not-allowed rounded-xl py-6 text-[15px] font-semibold"
                >
                  Sign Up
                </Button>
              </form>
            </>
          )}

          {mode === "otp" && !otpToken && (
            <form className="mt-2 text-left" onSubmit={otpRequestForm.handleSubmit(onSendOtp)}>
              <label className="mb-1.5 block text-[12.5px] font-semibold tracking-wide text-[#344054]">
                Mobile Number
              </label>
              <div className="mb-2 flex items-center rounded-xl border-[1.5px] border-[#e4e7ec] bg-[#f9fafb] px-3.5 py-3 focus-within:border-[#3bbf6b] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(35,157,76,0.1)]">
                <Phone className="mr-2 h-[17px] w-[17px] shrink-0 text-[#98a2b3]" />
                <span className="mr-1.5 text-xs text-[#292828]">+91</span>
                <input
                  id="otpMobile"
                  inputMode="numeric"
                  maxLength={10}
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#101828] outline-none"
                  {...otpRequestForm.register("mobileNumber")}
                />
              </div>
              <FieldError message={otpRequestForm.formState.errors.mobileNumber?.message} />

              <Button
                type="submit"
                disabled={submitting}
                className="mt-3 w-full rounded-xl py-6 text-[15px] font-semibold shadow-[0_8px_20px_rgba(35,157,76,0.28)]"
                style={{ background: "linear-gradient(135deg, #2ba85b, #1c7a3d)" }}
              >
                {submitting ? "Sending..." : "Send OTP"}
              </Button>
              <div className="mt-5 text-center">
                <button
                  type="button"
                  className="text-sm font-semibold text-[#101828] hover:text-[#3bbf6b]"
                  onClick={() => switchMode("password")}
                >
                  Login with Password?
                </button>
              </div>
            </form>
          )}

          {mode === "otp" && otpToken && (
            <form className="mt-2 text-left" onSubmit={otpVerifyForm.handleSubmit(onVerifyOtp)}>
              <label className="mb-3 block text-[13px] font-semibold text-[#344054]">Enter OTP Code</label>
              <input
                id="otpCode"
                inputMode="numeric"
                placeholder="••••"
                className="mb-1 w-full rounded-xl border-[1.5px] border-[#e4e7ec] bg-[#f9fafb] px-3.5 py-3 text-center text-lg font-semibold tracking-[0.3em] text-[#101828] outline-none focus:border-[#3bbf6b] focus:bg-white focus:shadow-[0_0_0_4px_rgba(35,157,76,0.12)]"
                {...otpVerifyForm.register("otpCode")}
              />
              <FieldError message={otpVerifyForm.formState.errors.otpCode?.message} />

              <Button
                type="submit"
                disabled={submitting}
                className="mt-3 w-full rounded-xl py-6 text-[15px] font-semibold shadow-[0_8px_20px_rgba(35,157,76,0.28)]"
                style={{ background: "linear-gradient(135deg, #2ba85b, #1c7a3d)" }}
              >
                {submitting ? "Verifying..." : "Verify & sign in"}
              </Button>
              <p className="mt-4 text-center text-sm text-[#667085]">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  className="font-semibold text-[#1c7a3d] hover:underline"
                  onClick={() => otpRequestForm.handleSubmit(onSendOtp)()}
                >
                  Resend
                </button>
              </p>
            </form>
          )}

          {mode === "forget" && (
            <form className="mt-2 text-left" onSubmit={forgetForm.handleSubmit(onForgetSubmit)}>
              <label className="mb-1.5 block text-[12.5px] font-semibold tracking-wide text-[#344054]">
                Mobile Number
              </label>
              <div className="mb-2 flex items-center rounded-xl border-[1.5px] border-[#e4e7ec] bg-[#f9fafb] px-3.5 py-3 focus-within:border-[#3bbf6b] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(35,157,76,0.1)]">
                <Phone className="mr-2 h-[17px] w-[17px] shrink-0 text-[#98a2b3]" />
                <span className="mr-1.5 text-xs text-[#292828]">+91</span>
                <input
                  id="fMobile"
                  inputMode="numeric"
                  maxLength={10}
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#101828] outline-none"
                  {...forgetForm.register("mobileNumber")}
                />
              </div>
              <FieldError message={forgetForm.formState.errors.mobileNumber?.message} />

              <label className="mb-1.5 mt-2 block text-[12.5px] font-semibold tracking-wide text-[#344054]">
                OTP Code
              </label>
              <input
                id="fOtp"
                placeholder="Enter the OTP"
                className="mb-2 w-full rounded-xl border-[1.5px] border-[#e4e7ec] bg-[#f9fafb] px-3.5 py-3 text-sm font-medium text-[#101828] outline-none focus:border-[#3bbf6b] focus:bg-white focus:shadow-[0_0_0_4px_rgba(35,157,76,0.1)]"
                {...forgetForm.register("otpCode")}
              />
              <FieldError message={forgetForm.formState.errors.otpCode?.message} />

              <label className="mb-1.5 block text-[12.5px] font-semibold tracking-wide text-[#344054]">
                New Password
              </label>
              <div className="relative mb-2 flex items-center rounded-xl border-[1.5px] border-[#e4e7ec] bg-[#f9fafb] px-3.5 py-3 focus-within:border-[#3bbf6b] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(35,157,76,0.1)]">
                <Lock className="mr-2.5 h-[17px] w-[17px] shrink-0 text-[#98a2b3]" />
                <input
                  id="fNewPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a strong password"
                  className="min-w-0 flex-1 bg-transparent pr-6 text-sm font-medium text-[#101828] outline-none placeholder:font-normal placeholder:text-[#98a2b3]"
                  {...forgetForm.register("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 text-[#98a2b3] hover:text-[#667085]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError message={forgetForm.formState.errors.newPassword?.message} />

              <label className="mb-1.5 block text-[12.5px] font-semibold tracking-wide text-[#344054]">
                Confirm Password
              </label>
              <div className="relative mb-2 flex items-center rounded-xl border-[1.5px] border-[#e4e7ec] bg-[#f9fafb] px-3.5 py-3 focus-within:border-[#3bbf6b] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(35,157,76,0.1)]">
                <Lock className="mr-2.5 h-[17px] w-[17px] shrink-0 text-[#98a2b3]" />
                <input
                  id="fConfirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className="min-w-0 flex-1 bg-transparent pr-6 text-sm font-medium text-[#101828] outline-none placeholder:font-normal placeholder:text-[#98a2b3]"
                  {...forgetForm.register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 text-[#98a2b3] hover:text-[#667085]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError message={forgetForm.formState.errors.confirmPassword?.message} />

              <Button
                type="submit"
                disabled={submitting}
                className="mt-3 w-full rounded-xl py-6 text-[15px] font-semibold shadow-[0_8px_20px_rgba(35,157,76,0.28)]"
                style={{ background: "linear-gradient(135deg, #2ba85b, #1c7a3d)" }}
              >
                {submitting ? "Resetting..." : "Reset Password"}
              </Button>
              <div className="mt-5 text-center">
                <button
                  type="button"
                  className="text-sm font-semibold text-[#101828] hover:text-[#3bbf6b]"
                  onClick={() => switchMode("password")}
                >
                  Login with Password?
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
