export function normalizePhone(phone = "") {
  return String(phone).replace(/[^\d]/g, "");
}

export function phoneToEmail(phone) {
  return `${normalizePhone(phone)}@fierostore.app`;
}

export function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseCsv(value = "") {
  return String(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}
