
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { createServer } from "http";
import "@shopify/shopify-api/adapters/node";
import connectDB from "./config/db.js";
import { shopifyApi, ApiVersion } from "@shopify/shopify-api";
import shopifyRoutes from "./routes/shopifyRoutes.js";
import { SuperfaceClient } from "@superfaceai/one-sdk";
import StoreRoutes from "./routes/StoreRoutes.js";
import WebSocket, { WebSocketServer } from "ws";
import categoryRoutes from "./routes/categoryRoutes.js";
import { createProxyMiddleware } from "http-proxy-middleware";
import locationRoutes from "./routes/locationRoutes.js"
import SettingRoutes from "./routes/SettingRoutes.js";
import initializeDefaultSettings from "./seed/initializeDefaultSettings.js";

dotenv.config();
console.log("Environment variables loaded:", process.env);

const sdk = new SuperfaceClient();

// Initialize Shopify API
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
  scopes: process.env.SCOPES.split(","),
  hostName: process.env.SHOPIFY_APP_HOST.replace(/^https?:\/\//, ""),
  apiVersion: ApiVersion.October23,
  isEmbeddedApp: true,
  accessMode: "offline",
});

connectDB();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5175",
      /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/,
      /^https:\/\/[a-z0-9-]+\.myshopify\.com$/
    ];

    if (!origin || allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));
// newly added


// newlyadded

// Proxy middleware
app.use('/apps/stores', createProxyMiddleware({
  target: "https://humanities-halifax-communications-hence.trycloudflare.com", 
  changeOrigin: true,
  pathRewrite: {
      '^/apps/stores': '/apps/stores', 
  },
  onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('Host', 'https://humanities-halifax-communications-hence.trycloudflare.com');
  },
  onProxyRes: (proxyRes, req, res) => {
      console.log('Proxy Response Headers:', proxyRes.headers);
  },
  onError: (err, req, res) => {
      console.error('Proxy Error:', err);
      res.status(500).send('Proxy Error: ' + err.message);
  },
  logLevel: 'debug', 
}));

// Authorization routes
app.get("/auth", async (req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).send("Shop is required");
  }

  try {
    const authRoute = await shopify.auth.beginAuth(req, res, shop, "/auth/callback", false);
    res.redirect(authRoute);
  } catch (error) {
    console.error(`Error initiating Shopify authentication: ${error.message}`, error);
    res.status(500).send("Error initiating authentication");
  }
});

app.get("/auth/callback", async (req, res) => {
  const { shop, code, hmac, state } = req.query;

  if (!shop || !code || !hmac || !state) {
    return res.status(400).send("Missing required parameters");
  }

  try {
    const session = await shopify.auth.validateAuthCallback(req, res, req.query);
    const accessToken = session.accessToken;
    console.log(`Access token for ${session.shop}: ${accessToken}`);
    res.status(200).send("Authorization successful!");
  } catch (error) {
    console.error(`Error during authorization: ${error.message}`, error);
    res.status(500).send("Error during authorization");
  }
});

// Geocode API logic
const geocodeLocation = async (loc) => {
  const profile = await sdk.getProfile("address/geocoding@3.1.2");
  const result = await profile.getUseCase("Geocode").perform({ query: loc }, { provider: "nominatim" });
  return result.unwrap();
};

app.get("/api/geocode", async (req, res) => {
  try {
    const location = req.query.location;
    if (!location) {
      return res.status(400).json({ error: "Location is required" });
    }
    const coordinates = await geocodeLocation(location);
    res.json({ location, coordinates });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Routes
app.use("/api/v1/shopify", shopifyRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/stores", StoreRoutes);
app.use('/api/v1/stores', locationRoutes);
app.use('/api/v1/settings',SettingRoutes);
// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("WebSocket connection established");
  ws.on("message", (message) => {
    console.log("Received message:", message);
    ws.send(`Received: ${message}`);
  });
  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Mapify</h1>");
});

const PORT = process.env.PORT || 5175;
server.listen(PORT, () => {
  console.log(`Server running on ${process.env.DEV_MODE} mode on port ${PORT}.`);
});
