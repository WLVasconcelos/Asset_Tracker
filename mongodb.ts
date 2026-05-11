import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is missing!');
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 10000, // 10 seconds timeout
    };

    console.log('Attempting to connect to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB Connected Successfully');
      return mongoose;
    }).catch(err => {
      console.error('MongoDB Connection Error Details:', {
        message: err.message,
        code: err.code,
        name: err.name
      });
      cached.promise = null;
      throw err;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
}

export default dbConnect;
