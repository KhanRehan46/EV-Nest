import mongoose from 'mongoose';
import { getMockModel } from '../config/mockDb.js';

const chargerSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    connectorType: {
      type: String,
      enum: ['Type2', 'CCS', 'CHAdeMO', 'Bharat AC'],
      required: true,
    },
    speedKw: {
      type: Number,
      required: true,
    },
    pricePerKwh: {
      type: Number,
      required: true,
    },
    markupPercent: {
      type: Number,
      required: true,
      default: 0,
    },
    photos: {
      type: [String],
      default: [],
    },
    isLive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseCharger = mongoose.model('Charger', chargerSchema);

class ChargerWrapper {
  constructor(data) {
    if (global.useMockDb) {
      return getMockModel('Charger').buildInstance(data);
    }
    return new MongooseCharger(data);
  }

  static find(...args) {
    return global.useMockDb ? getMockModel('Charger').find(...args) : MongooseCharger.find(...args);
  }

  static findOne(...args) {
    return global.useMockDb ? getMockModel('Charger').findOne(...args) : MongooseCharger.findOne(...args);
  }

  static findById(...args) {
    return global.useMockDb ? getMockModel('Charger').findById(...args) : MongooseCharger.findById(...args);
  }

  static create(...args) {
    return global.useMockDb ? getMockModel('Charger').create(...args) : MongooseCharger.create(...args);
  }

  static findByIdAndDelete(...args) {
    return global.useMockDb ? getMockModel('Charger').findByIdAndDelete(...args) : MongooseCharger.findByIdAndDelete(...args);
  }

  static insertMany(data) {
    if (global.useMockDb) {
      // Just write/append for mock
      const model = getMockModel('Charger');
      data.forEach(item => model.create(item));
      return data;
    }
    return MongooseCharger.insertMany(data);
  }
}

export default ChargerWrapper;
export { chargerSchema };
