export function formatCurrency(value: number) {
  return `$${Number(value || 0).toLocaleString("es-CL")}`;
}

export function getInitials(...parts: (string | undefined)[]) {
  return parts
    .filter(Boolean)
    .join(" ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
