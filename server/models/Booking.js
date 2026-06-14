import mongoose from 'mongoose';
import { getMockModel } from '../config/mockDb.js';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    chargerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Charger',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    estimatedCost: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const MongooseBooking = mongoose.model('Booking', bookingSchema);

class BookingWrapper {
  constructor(data) {
    if (global.useMockDb) {
      return getMockModel('Booking').buildInstance(data);
    }
    return new MongooseBooking(data);
  }

  static find(...args) {
    return global.useMockDb ? getMockModel('Booking').find(...args) : MongooseBooking.find(...args);
  }

  static findOne(...args) {
    return global.useMockDb ? getMockModel('Booking').findOne(...args) : MongooseBooking.findOne(...args);
  }

  static findById(...args) {
    return global.useMockDb ? getMockModel('Booking').findById(...args) : MongooseBooking.findById(...args);
  }

  static create(...args) {
    return global.useMockDb ? getMockModel('Booking').create(...args) : MongooseBooking.create(...args);
  }

  static findByIdAndUpdate(...args) {
    return global.useMockDb ? getMockModel('Booking').findByIdAndUpdate(...args) : MongooseBooking.findByIdAndUpdate(...args);
  }
}

export default BookingWrapper;
export { bookingSchema };
