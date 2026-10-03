export const CURRENCY = "$";

export const formatPrice = (value: number | string | null | undefined): string => {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : 0;
  return `${safe.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${CURRENCY}`;
};

export const formatDate = (value: string | number | Date | null | undefined): string => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
};

export const toPlain = <T>(value: T): T => JSON.parse(JSON.stringify(value ?? null));
