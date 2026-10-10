const round2 = (n) => Math.round(Number(n) * 100) / 100;

function calcFinalPrice(price, discount = 0) {
  const p = Number(price) || 0;
  const d = Math.min(Math.max(Number(discount) || 0, 0), 100);
  return round2(p - (p * d) / 100);
}

function computeMinPrice(variants = []) {
  const prices = variants
    .map((v) => (typeof v.finalPrice === "number" ? v.finalPrice : calcFinalPrice(v.price, v.discount)))
    .filter((n) => Number.isFinite(n));
  return prices.length ? Math.min(...prices) : 0;
}

const SHIPPING_COST = Number(process.env.SHIPPING_COST || 0);
const FREE_SHIPPING_OVER = Number(process.env.FREE_SHIPPING_OVER || 0);

function shippingCostFor(amount) {
  if (!SHIPPING_COST) return 0;
  if (FREE_SHIPPING_OVER && amount >= FREE_SHIPPING_OVER) return 0;
  return SHIPPING_COST;
}

const formatMoney = (amount) => `${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} $`;

export { round2, computeMinPrice, calcFinalPrice, shippingCostFor, formatMoney };
