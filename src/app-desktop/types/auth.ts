export type UserRole = "super_admin" | "admin" | "ENTERPRISE" | string;

export interface Session {
  accessToken: string;
  role: UserRole;
  userId: string;
  parentId: string;
  username: string;
  mobileNumber: string;
  planId: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  role: UserRole;
  id: string;
  username: string;
  mobileNumber: string;
  planId?: string | null;
}

export interface ApiEnvelope<T> {
  status: "SUCCESS" | "FAILURE" | string;
  statusCode?: string;
  message?: string;
  data?: T;
}
