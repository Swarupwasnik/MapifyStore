import { shopifyApi, ApiVersion } from "@shopify/shopify-api";
import dotenv from "dotenv";

dotenv.config();
export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
  scopes: process.env.SCOPES.split(","),
  hostName: process.env.SHOPIFY_APP_HOST.replace(/^https?:\/\//, ""),
  apiVersion: ApiVersion.October23,
  isEmbeddedApp: true,
  accessMode: "offline",
});
