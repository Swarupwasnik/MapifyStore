import { shopifyApi, ApiVersion } from '@shopify/shopify-api';
import dotenv from 'dotenv';

dotenv.config();

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
  scopes: process.env.SCOPES.split(','),
  hostName: process.env.SHOPIFY_APP_HOST.replace(/^https?:\/\//, ''),
  apiVersion: ApiVersion.October23,
  isEmbeddedApp: true,
  accessMode: 'offline',
});

export const initiateOAuth = async (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send('Shop is required');
  const authRoute = await shopify.auth.beginAuth(req, res, shop, '/auth/callback', false);
  res.redirect(authRoute);
};

export const handleOAuthCallback = async (req, res) => {
  try {
    const session = await shopify.auth.validateAuthCallback(req, res, req.query);
    const accessToken = session.accessToken;
    console.log(`Access token for ${session.shop}: ${accessToken}`);
    res.status(200).send('Authorization successful!');
  } catch (error) {
    console.error(`Error during authorization: ${error.message}`, error);
    res.status(500).send('Error during authorization');
  }
};
