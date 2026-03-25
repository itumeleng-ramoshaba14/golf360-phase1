export function formatCurrency(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function statusClass(status?: string) {
  switch ((status || "").toUpperCase()) {
    case "CONFIRMED":
    case "AVAILABLE":
      return "status status-success";
    case "PENDING":
    case "LIMITED":
      return "status status-warning";
    case "CANCELLED":
    case "FULL":
    case "CLOSED":
      return "status status-danger";
    default:
      return "status";
  }
}