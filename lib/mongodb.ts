import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local\n' +
    'For development, you can use MongoDB Atlas (free tier available):\n' +
    '1. Go to https://cloud.mongodb.com/\n' +
    '2. Create a free cluster\n' +
    '3. Get your connection string\n' +
    '4. Add it to .env.local as MONGODB_URI=your_connection_string'
  );
}

interface GlobalMongoDB {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // This must be a `var` and not a `let / const`
  var mongodb: GlobalMongoDB | undefined;
}

let cached = global.mongodb || { conn: null, promise: null };

if (!global.mongodb) {
  global.mongodb = cached;
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('Connected to MongoDB successfully');
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;