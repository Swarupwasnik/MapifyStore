import mongoose from 'mongoose';
import Settings from '../models/settingsModel.js';
import dotenv from 'dotenv';

dotenv.config();

const initializeDefaultSettings = async () => {
  try {
    // Correct use of process.env for accessing environment variables
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const existingSettings = await Settings.findOne();
    if (existingSettings) {
      console.log('Default settings already exist:', existingSettings);
      return;
    }

    const defaultSettings = new Settings({
      companyName: 'Your Company',
      contactEmail: 'contact@yourcompany.com',
      radius: '10',
      enableGeolocation: false,
      unit: 'km',
      zoomLevel: 10,
      mapColor: '#3498db',
      centerCoordinates: [23.0225, 72.5714],
    });

    await defaultSettings.save();
    console.log('Default settings created successfully!');
  } catch (err) {
    console.error('Error initializing default settings:', err);
  } finally {
    mongoose.connection.close();
  }
};

export default initializeDefaultSettings;
