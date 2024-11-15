
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      tlsAllowInvalidCertificates: true, // Use for testing purposes only
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Mongo Error:', error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;

