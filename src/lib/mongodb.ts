import mongoose from 'mongoose';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('DATABASE_ERROR: MONGODB_URI is not defined in environment variables');
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 10000,
    };

    console.log('Initiating new MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Successfully connected to MongoDB');
      return mongoose;
    }).catch(err => {
      console.error('Failed to connect to MongoDB:', err.message);
      cached.promise = null;
      throw err;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Error awaiting MongoDB connection:', e);
    throw e;
  }
  
  return cached.conn;
}

export default dbConnect;
