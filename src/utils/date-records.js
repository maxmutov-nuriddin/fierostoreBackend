import { DateRecord } from "../models/DateRecord.js";

export async function recordDateEvent({
  entityType,
  entityId,
  kind,
  note = "",
  meta = {},
  date = new Date()
}) {
  await DateRecord.create({
    entityType,
    entityId: String(entityId),
    kind,
    note,
    meta,
    date
  });
}
