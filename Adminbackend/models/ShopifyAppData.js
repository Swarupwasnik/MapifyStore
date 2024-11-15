import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ShopifyAppDataSchema = new Schema({
  shopDomain: { type: String, required: true, unique: true },
  accessToken: { type: String, required: true },
  installedAt: { type: Date, default: Date.now },
});

export default model('ShopifyAppData', ShopifyAppDataSchema);

