import { firstParam } from "@/utils/searchParams";
import type { SearchParams } from "@/types";

/* ?status=approved -> "approved"; missing / unknown -> "all" (no filter). `key` reads another param (e.g. "role"). */
export const pickStatus = <T extends string>(
  params: SearchParams,
  allowed: readonly T[],
  key = "status"
): T | "all" => {
  const raw = firstParam(params[key]);
  return allowed.find((item) => item === raw) ?? "all";
};
