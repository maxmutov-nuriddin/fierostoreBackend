import { Card } from "../models/Card.js";
import { slugify } from "./formatters.js";

export async function buildUniqueCardSlug(title, excludeId = null) {
  const baseSlug = slugify(title) || `card-${Date.now()}`;
  let slug = baseSlug;
  let attempt = 1;

  while (true) {
    const existing = await Card.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {})
    });

    if (!existing) {
      return slug;
    }

    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }
}
