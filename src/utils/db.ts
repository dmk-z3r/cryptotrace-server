import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


const mongoUri = process.env.MONGO_URI;

function connect() {
  if (!mongoUri) {
    throw new Error('MONGO_URI must be defined');
  }
  return mongoose.connect(mongoUri);
}

export default connect;