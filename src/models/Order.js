import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: ""
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    size: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Order should include at least one item."
      }
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["new", "confirmed", "shipped", "delivered"],
      default: "new"
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.userId = ret.userId ? ret.userId.toString() : undefined;
        delete ret._id;
        return ret;
      }
    }
  }
);

export const Order = mongoose.models.Order ?? mongoose.model("Order", orderSchema);
