import type { SearchParams } from "@/types";

export const firstParam = (value: string | string[] | undefined, max = 100): string => {
  const str = Array.isArray(value) ? value[0] : value;
  return typeof str === "string" ? str.trim().slice(0, max) : "";
};

export const toQuery = <TKeys extends string = string>(params: SearchParams = {}): Partial<Record<TKeys, string>> =>
  Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => [key, firstParam(value, 200)] as const)
      .filter(([, value]) => value !== "")
  ) as Partial<Record<TKeys, string>>;

export const listKey = (query: Record<string, string | undefined>) =>
  new URLSearchParams(
    Object.entries(query).filter((entry): entry is [string, string] => entry[0] !== "cursor" && Boolean(entry[1]))
  ).toString();
