import mongoose from 'mongoose';
import { ensureEnv } from './env';

// Validate only the env vars this module needs.
ensureEnv(['MONGODB_URI']);

const MONGODB_URI = process.env.MONGODB_URI;

// Do not throw at import time. Only throw when attempting to connect so that
// routes which don't require the DB (like scraping without saving) can run
// without a configured MONGODB_URI.

/**
 * Mongoose connection helper. Uses a global cache in development to avoid
 * creating multiple connections during HMR.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connect() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env.local');
  }
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
      family: 4, // Force IPv4
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Successfully connected to MongoDB');
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connect;
