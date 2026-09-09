import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { getRedirectRoute } from "@/app-desktop/auth/AuthContext";
import { loginWithPassword, sendLoginOtp, verifyLoginOtp, forgetPassword } from "@/app-desktop/api/auth.api";
import { ApiError } from "@/app-desktop/api/httpClient";

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

export default function Login() {
  const [mode, setMode] = useState<LoginMode>("password");
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [otpMobile, setOtpMobile] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to KaamSaathi</CardTitle>
          <CardDescription>
            {mode === "password" && "Enter your mobile number and password"}
            {mode === "otp" && "Sign in with a one-time password"}
            {mode === "forget" && "Reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "password" && (
            <form className="space-y-4" onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile number</Label>
                <Input id="mobileNumber" inputMode="numeric" {...passwordForm.register("mobileNumber")} />
                {passwordForm.formState.errors.mobileNumber && (
                  <p className="text-sm text-destructive">{passwordForm.formState.errors.mobileNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...passwordForm.register("password")} />
                {passwordForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{passwordForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                Sign in
              </Button>
              <div className="flex justify-between text-sm">
                <button type="button" className="text-primary underline" onClick={() => switchMode("otp")}>
                  Sign in with OTP
                </button>
                <button type="button" className="text-primary underline" onClick={() => switchMode("forget")}>
                  Forgot password?
                </button>
              </div>
            </form>
          )}

          {mode === "otp" && !otpToken && (
            <form className="space-y-4" onSubmit={otpRequestForm.handleSubmit(onSendOtp)}>
              <div className="space-y-2">
                <Label htmlFor="otpMobile">Mobile number</Label>
                <Input id="otpMobile" inputMode="numeric" {...otpRequestForm.register("mobileNumber")} />
                {otpRequestForm.formState.errors.mobileNumber && (
                  <p className="text-sm text-destructive">{otpRequestForm.formState.errors.mobileNumber.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                Send OTP
              </Button>
              <button type="button" className="text-sm text-primary underline" onClick={() => switchMode("password")}>
                Back to password sign in
              </button>
            </form>
          )}

          {mode === "otp" && otpToken && (
            <form className="space-y-4" onSubmit={otpVerifyForm.handleSubmit(onVerifyOtp)}>
              <div className="space-y-2">
                <Label htmlFor="otpCode">Enter OTP</Label>
                <Input id="otpCode" inputMode="numeric" {...otpVerifyForm.register("otpCode")} />
                {otpVerifyForm.formState.errors.otpCode && (
                  <p className="text-sm text-destructive">{otpVerifyForm.formState.errors.otpCode.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                Verify & sign in
              </Button>
            </form>
          )}

          {mode === "forget" && (
            <form className="space-y-4" onSubmit={forgetForm.handleSubmit(onForgetSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="fMobile">Mobile number</Label>
                <Input id="fMobile" inputMode="numeric" {...forgetForm.register("mobileNumber")} />
                {forgetForm.formState.errors.mobileNumber && (
                  <p className="text-sm text-destructive">{forgetForm.formState.errors.mobileNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fOtp">OTP</Label>
                <Input id="fOtp" {...forgetForm.register("otpCode")} />
                {forgetForm.formState.errors.otpCode && (
                  <p className="text-sm text-destructive">{forgetForm.formState.errors.otpCode.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fNewPassword">New password</Label>
                <Input id="fNewPassword" type="password" {...forgetForm.register("newPassword")} />
                {forgetForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">{forgetForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fConfirmPassword">Confirm password</Label>
                <Input id="fConfirmPassword" type="password" {...forgetForm.register("confirmPassword")} />
                {forgetForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{forgetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                Reset password
              </Button>
              <button type="button" className="text-sm text-primary underline" onClick={() => switchMode("password")}>
                Back to sign in
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
