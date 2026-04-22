import mongoose from "mongoose";

const dateRecordSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["card", "user", "order", "review"],
      required: true
    },
    entityId: {
      type: String,
      required: true,
      trim: true
    },
    kind: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    note: {
      type: String,
      default: "",
      trim: true
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      }
    }
  }
);

dateRecordSchema.index({ entityType: 1, entityId: 1, date: -1 });

export const DateRecord = mongoose.models.DateRecord ?? mongoose.model("DateRecord", dateRecordSchema);
