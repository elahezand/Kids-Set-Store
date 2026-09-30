const round2 = (n) => Math.round(Number(n) * 100) / 100;

function calcFinalPrice(price, discount = 0) {
  const p = Number(price) || 0;
  const d = Math.min(Math.max(Number(discount) || 0, 0), 100);
  return round2(p - (p * d) / 100);
}

function variantFinalPrice(variant) {
  return variant ? variant.finalPrice : null;
}

function computeMinPrice(variants = []) {
  const prices = variants
    .map((v) => (typeof v.finalPrice === "number" ? v.finalPrice : calcFinalPrice(v.price, v.discount)))
    .filter((n) => Number.isFinite(n));
  return prices.length ? Math.min(...prices) : 0;
}

export {
  round2,
  computeMinPrice,
  calcFinalPrice,
  variantFinalPrice,

};