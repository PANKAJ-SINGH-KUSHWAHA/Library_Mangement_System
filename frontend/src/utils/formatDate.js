export default function formatDate(dateInput, options = {}) {
  if (!dateInput) return null;

  // Accept Date object or ISO date string (YYYY-MM-DD or full ISO)
  let d = dateInput;
  if (typeof dateInput === "string") {
    // Some backends send just 'YYYY-MM-DD' which Date treats as UTC; normalize
    // If string matches YYYY-MM-DD, append 'T00:00:00' to avoid timezone shifts
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      d = new Date(dateInput + "T00:00:00");
    } else {
      d = new Date(dateInput);
    }
  }

  if (!(d instanceof Date) || isNaN(d.getTime())) return null;

  const locale = options.locale || "en-GB"; // Day-month-year, familiar format
  const fmt = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options.formatOptions,
  };

  return d.toLocaleDateString(locale, fmt);
}
