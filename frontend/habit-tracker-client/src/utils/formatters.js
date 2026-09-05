export const formatCurrency = (value, currency = "BDT") => {
  const amount = Number(value || 0);

  if (currency === "BDT") {
    const formatted = new Intl.NumberFormat("en-BD", {
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
    return `৳${formatted}`;
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
};

export const formatMinutes = (value) => {
  const totalMinutes = Math.max(0, Math.round(Number(value || 0)));
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};
