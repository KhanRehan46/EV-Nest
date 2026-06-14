import mongoose from 'mongoose';
import { getMockModel } from '../config/mockDb.js';

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseReview = mongoose.model('Review', reviewSchema);

class ReviewWrapper {
  constructor(data) {
    if (global.useMockDb) {
      return getMockModel('Review').buildInstance(data);
    }
    return new MongooseReview(data);
  }

  static find(...args) {
    return global.useMockDb ? getMockModel('Review').find(...args) : MongooseReview.find(...args);
  }

  static findOne(...args) {
    return global.useMockDb ? getMockModel('Review').findOne(...args) : MongooseReview.findOne(...args);
  }

  static findById(...args) {
    return global.useMockDb ? getMockModel('Review').findById(...args) : MongooseReview.findById(...args);
  }

  static create(...args) {
    return global.useMockDb ? getMockModel('Review').create(...args) : MongooseReview.create(...args);
  }
}

export default ReviewWrapper;
export { reviewSchema };
