import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], required: true, default: 'Point' },
  coordinates: { type: [Number], required: true } 
}, { _id: false });

const Location = mongoose.model('Location', LocationSchema);
export default Location;
