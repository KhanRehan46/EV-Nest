import mongoose from 'mongoose';
import { getMockModel } from '../config/mockDb.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'merchant'],
      default: 'user',
    },
    carModel: {
      type: String,
      default: '',
    },
    batteryCapacityKwh: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseUser = mongoose.model('User', userSchema);

class UserWrapper {
  constructor(data) {
    if (global.useMockDb) {
      return getMockModel('User').buildInstance(data);
    }
    return new MongooseUser(data);
  }

  static find(...args) {
    return global.useMockDb ? getMockModel('User').find(...args) : MongooseUser.find(...args);
  }

  static findOne(...args) {
    return global.useMockDb ? getMockModel('User').findOne(...args) : MongooseUser.findOne(...args);
  }

  static findById(...args) {
    return global.useMockDb ? getMockModel('User').findById(...args) : MongooseUser.findById(...args);
  }

  static create(...args) {
    return global.useMockDb ? getMockModel('User').create(...args) : MongooseUser.create(...args);
  }
}

export default UserWrapper;
export { userSchema };
