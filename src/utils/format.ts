/*
  One place for how money / dates are shown on the site.
  Prices in the DB are Toman (see toRial() in the order services); the UI labels them
  with CURRENCY — change it here only.
*/
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

/* lean() docs / ObjectIds / Dates -> plain JSON that can cross into client components */
export const toPlain = <T>(value: T): T => JSON.parse(JSON.stringify(value ?? null));
