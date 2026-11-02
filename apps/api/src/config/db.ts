import dns from 'dns';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './index';

// Fix for Windows Node.js querySrv ECONNREFUSED with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if not permitted
}

let mongoMemoryServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // 1. If explicit in-memory DB requested (e.g. during integration tests)
  if (process.env.USE_MEMORY_DB === 'true') {
    try {
      console.log('USE_MEMORY_DB=true: Starting embedded in-memory MongoDB...');
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`Connected to embedded MongoDB at ${uri}`);
      return conn;
    } catch (err: any) {
      console.warn('⚠️ Embedded MongoDB unavailable, falling back to mock mode.');
      mongoose.set('bufferCommands', false);
      mongoose.set('bufferTimeoutMS', 1000);
      return mongoose;
    }
  }

  // 2. Try external MongoDB Atlas if configured
  if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb://127.0.0.1:27017/bizpockethub') {
    try {
      console.log('Connecting to external MongoDB Atlas...');
      const connectPromise = mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 2500,
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Connection/DNS timeout (3s)')), 3000)
      );
      const conn = await Promise.race([connectPromise, timeoutPromise]);
      console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);
      return conn;
    } catch (err: any) {
      console.warn(`External MongoDB connection failed (${err?.message || err}), falling back...`);
    }
  }

  // 3. Try local MongoDB with short timeout
  const localUri = 'mongodb://127.0.0.1:27017/bizpockethub';
  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`Connected to local MongoDB at ${localUri}`);
    return conn;
  } catch {
    if (process.env.USE_MEMORY_DB === 'false') {
      console.log('USE_MEMORY_DB=false: Running without active MongoDB connection (Standalone fallback mode active).');
      mongoose.set('bufferCommands', false);
      mongoose.set('bufferTimeoutMS', 1000);
      return mongoose;
    }

    try {
      console.log('Local MongoDB not running. Attempting embedded in-memory MongoDB...');
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`Connected to embedded MongoDB at ${uri}`);
      return conn;
    } catch (err: any) {
      console.warn('⚠️ Embedded MongoDB binary download unavailable / timed out.');
      console.log('⚡ Biz List Place is running in Zero-Config Standalone Mock Mode.');
      mongoose.set('bufferCommands', false);
      mongoose.set('bufferTimeoutMS', 1000);
      return mongoose;
    }
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
  }
}
