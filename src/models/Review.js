import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.cardId = ret.cardId.toString();
        ret.userId = ret.userId ? ret.userId.toString() : undefined;
        delete ret._id;
        return ret;
      }
    }
  }
);

reviewSchema.index({ cardId: 1, createdAt: -1 });

export const Review = mongoose.models.Review ?? mongoose.model("Review", reviewSchema);
