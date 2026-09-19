// Register Modal

export type Step = 0 | 1;

export interface RegistrationData {
  phone: string;
  otp: string;
}

// Step0Email
export interface Step0PhoneProps {
  setPhone: (phone: string) => void
  onSuccess: (remainingTime: string) => void;
}

// Step1Verification

export interface Step1VerificationProps {
  phone: string
  onSuccess: () => void;
  goBack: () => void;
  initialRemainingTime?: string;
}