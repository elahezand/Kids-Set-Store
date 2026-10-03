import type { SearchParams } from "@/types";

export const pickStatus = <T extends string>(params: SearchParams, allowed: readonly T[]): T | "all" => {
  const raw = params.status;
  return allowed.find((item) => item === raw) ?? "all";
};
