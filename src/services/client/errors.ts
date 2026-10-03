import { isAxiosError } from "axios";
import { toast } from "sonner";
import type { AuthError } from "@/services/client/http";
import type { ApiFailure } from "@/types";

export const getErrorMessage = (error: unknown, fallback = "Something went wrong"): string => {
  if (isAxiosError<ApiFailure>(error)) {
    const body = error.response?.data;
    if (body?.errors?.length) {
      return body.errors
        .map((item) => item.message)
        .filter(Boolean)
        .join(" | ");
    }
    if (body?.message) return body.message;
  }
  if (error instanceof Error && error.message && !isAxiosError(error)) return error.message;
  return fallback;
};

export const getErrorStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined;

export const showErrorToast = (error: unknown, fallback?: string) => {
  if ((error as AuthError | undefined)?._authToastShown) return;
  toast.error(getErrorMessage(error, fallback));
};
