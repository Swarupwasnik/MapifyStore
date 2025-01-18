import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  intent: {
    type: String,
    required: true,
  },
  payer: {
    payment_method: {
      type: String,
      required: true,
    },
  },
  transactions: [
    {
      amount: {
        total: {
          type: Number,
          required: true,
        },
        currency: {
          type: String,
          required: true,
        },
      },
      description: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
