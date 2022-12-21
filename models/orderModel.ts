import { Schema, model, models } from 'mongoose'

/* ======================
      orderModel
====================== */

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    itemsPrice: {
      type: Number,
      required: true
    },
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    paymentMethod: {
      type: String,
      required: true
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    shippingPrice: {
      type: Number,
      required: true
    },
    taxPrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    paymentResult: {
      id: String,
      status: String,
      email_address: String
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false
    },
    paidAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

const Order = models.Order || model('Order', orderSchema)
export default Order
