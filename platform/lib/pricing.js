function roundTo(value, step) {
  return Math.max(step, Math.round(value / step) * step);
}

function suggestedPriceCents(buildCostCents) {
  const cost = Number(buildCostCents || 0) / 100;
  if (!Number.isFinite(cost) || cost <= 0) return 0;

  // Boss rule: priced to win, not linear.
  // $5 build -> ~$500 sale. $50 build -> ~$1000 sale.
  // Below $5, keep a sensible minimum engagement price.
  // Above $50, add a healthier but still competitive margin.
  let price;
  if (cost <= 5) {
    price = 500;
  } else if (cost <= 50) {
    const t = (cost - 5) / 45;
    price = 500 + t * 500;
  } else {
    price = 1000 + (cost - 50) * 10;
  }

  // Round to a human sales number.
  if (price < 1000) return roundTo(price, 10) * 100;
  if (price < 5000) return roundTo(price, 50) * 100;
  return roundTo(price, 100) * 100;
}

function money(cents) {
  const value = Number(cents || 0) / 100;
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: value % 1 ? 2 : 0 }).format(value);
}

module.exports = { suggestedPriceCents, money };
