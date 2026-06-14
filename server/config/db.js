import mongoose from 'mongoose';

const connectDB = async () => {
  if (process.env.USE_MOCK_DB === 'true') {
    console.log('--------------------------------------------------');
    console.log('🤖 USE_MOCK_DB is set to true in environment.');
    console.log('💾 Running in LOCAL JSON database storage mode.');
    console.log('--------------------------------------------------');
    global.useMockDb = true;
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chargelink', {
      serverSelectionTimeoutMS: 3000, // Timeout after 3 seconds
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMockDb = false;
  } catch (error) {
    console.log('--------------------------------------------------');
    console.log(`⚠️  MongoDB connection failed: ${error.message}`);
    console.log('💾 FALLING BACK: Launching file-based database JSON storage.');
    console.log('💡 Note: Data is read/written to server/data/*.json');
    console.log('--------------------------------------------------');
    global.useMockDb = true;
  }
};

export default connectDB;
