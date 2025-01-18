// controllers/oauthController.js
import { shopifyApi } from "@shopify/shopify-api";
import dotenv from 'dotenv';

dotenv.config();

export const initiateOAuth = async (req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).send("Shop is required");
  }

  try {
    const authRoute = await shopifyApi.auth.beginAuth(req, res, shop, "/auth/callback", false);
    res.redirect(authRoute);
  } catch (error) {
    console.error(`Error initiating Shopify authentication: ${error.message}`, error);
    res.status(500).send("Error initiating authentication");
  }
};

export const handleOAuthCallback = async (req, res) => {
  const { shop, code, hmac, state } = req.query;

  if (!shop || !code || !hmac || !state) {
    return res.status(400).send("Missing required parameters");
  }

  try {
    const session = await shopifyApi.auth.validateAuthCallback(req, res, req.query);
    const accessToken = session.accessToken;
    console.log(`Access token for ${session.shop}: ${accessToken}`);
    res.status(200).send("Authorization successful!");
  } catch (error) {
    console.error(`Error during authorization: ${error.message}`, error);
    res.status(500).send("Error during authorization");
  }
};
