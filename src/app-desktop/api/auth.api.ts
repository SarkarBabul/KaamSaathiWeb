import { api } from "@/app-desktop/api/httpClient";
import type { ApiEnvelope, LoginResponse } from "@/app-desktop/types/auth";

export function loginWithPassword(body: { mobileNumber: string; password: string }) {
  return api.post<ApiEnvelope<LoginResponse> & { response?: LoginResponse; statusCode?: string }>(
    "default",
    "/v1/authenticate/companyLogin_TP",
    body,
  );
}

export function sendLoginOtp(mobileNumber: string) {
  return api.post<ApiEnvelope<{ otpToken: string }> & { otpToken?: string }>(
    "default",
    "/v1/authenticate/companyLogin_OTP",
    { mobileNumber },
  );
}

export function verifyLoginOtp(body: { mobileNumber: string; otpCode: string; otpToken: string }) {
  return api.post<ApiEnvelope<LoginResponse> & { response?: LoginResponse }>(
    "default",
    "/v1/authenticate/consumerLogin_ValidateOTP",
    body,
  );
}

export function forgetPassword(body: { mobileNumber: string; otpCode: string; newPassword: string }) {
  return api.post<ApiEnvelope<unknown>>("default", "/v1/authenticate/validateOtpAndResetPassword", body);
}

export function sendRegisterOtp(mobileNumber: string) {
  return api.post<ApiEnvelope<unknown>>("default", "/v1/authenticate/send-otp", { mobileNumber });
}

export function register(body: Record<string, unknown>) {
  return api.post<ApiEnvelope<unknown>>("default", "/v1/authenticate/register-with-otp", {
    ...body,
    industry: "Construction",
    role: "ADMIN",
  });
}

export function sendEnterpriseRegisterOtp(mobileNumber: string) {
  return api.post<ApiEnvelope<unknown>>("default", "/v1/authenticate/generateEnterpriseOtp", { mobileNumber });
}

export function registerEnterprise(body: Record<string, unknown>) {
  return api.post<ApiEnvelope<unknown>>("default", "/v1/authenticate/registerEnterprise", body);
}
