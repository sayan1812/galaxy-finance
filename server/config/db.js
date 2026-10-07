import mongoose from 'mongoose';

/**
 * MongoDB Atlas Connection Module for Galaxy Finance
 */
export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://priyanshuhalder2001_db_user:PgI7geTpkW7x2zgb@cluster0.kixosgn.mongodb.net/galaxy_finance?retryWrites=true&w=majority';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message || error);
    // Don't kill process immediately if offline during dev, but log error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

export default connectDB;
