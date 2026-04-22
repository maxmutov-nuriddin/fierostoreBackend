import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    images: {
      type: [String],
      default: []
    },
    sizes: {
      type: [String],
      default: ["M"]
    },
    colors: {
      type: [String],
      default: ["#111111"]
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    cardType: {
      type: String,
      required: true,
      trim: true,
      default: "standard"
    },
    tags: {
      type: [String],
      default: []
    },
    featured: {
      type: Boolean,
      default: false
    },
    isNewDrop: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    sortPriority: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
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

cardSchema.index({ category: 1, cardType: 1, createdAt: -1 });

export const Card = mongoose.models.Card ?? mongoose.model("Card", cardSchema);
