export interface SignInPayload {
  identifier: string; // phone or email
  password: string;
  remember?: boolean;
}

export interface SignUpPayload {
  username: string;
  email?: string;
  phone: string;
  password: string;
}

export interface SendOtpPayload {
  phone: string;
}

export interface SendOtpResult {
  remainingTime: string; // "mm:ss"
}

export interface VerifyOtpPayload {
  phone: string;
  code: string;
}

export interface ResetPasswordPayload {
  phone: string;
  resetCode: string;
  password: string;
}

export type AuthMode = "login" | "register" | "sms";
