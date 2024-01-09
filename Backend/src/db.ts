import mongoose from 'mongoose';

export async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Immerse');
    console.log('💾 Database is connected');
  } catch (error) {
    console.error(error);
  }
}
