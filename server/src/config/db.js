const mongoose = require('mongoose');

let isConnected = false;
let isFallbackMode = false;

/**
 * Connect to MongoDB with automatic fallback detection
 */
async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scholarfind';

  try {
    console.log(`Connecting to database at ${mongoUri}...`);
    // Attempt connection with 3-second timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    isFallbackMode = false;
    console.log('Successfully connected to MongoDB.');
  } catch (err) {
    console.warn('\n-----------------------------------------------------------');
    console.warn('NOTICE FOR BEGINNERS:');
    console.warn(`Could not connect to MongoDB server (${err.message}).`);
    console.warn('ScholarFind is automatically activating its Local Persistent Engine');
    console.warn('so all features (Registration, Matching, Admin, Tracking) work out-of-the-box!');
    console.warn('To use MongoDB, ensure MongoDB service is running or set MONGODB_URI in .env');
    console.warn('-----------------------------------------------------------\n');
    isConnected = false;
    isFallbackMode = true;
  }
}

function getDbStatus() {
  return {
    isConnected,
    isFallbackMode,
    mode: isFallbackMode ? 'Local Persistent Storage' : 'MongoDB (Mongoose)'
  };
}

module.exports = {
  connectDB,
  getDbStatus
};
