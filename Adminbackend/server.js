


import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { shopifyApi, ApiVersion } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import shopifyRoutes from "./routes/shopifyRoutes.js";
import { SuperfaceClient } from '@superfaceai/one-sdk';
import StoreRoutes from './routes/StoreRoutes.js';
import WebSocket, { WebSocketServer } from 'ws';
import categoryRoutes from "./routes/categoryRoutes.js"
import settingsRoutes from "../Adminbackend/routes/settingsRoutes.js";


dotenv.config();
console.log('Environment variables loaded:', process.env);

const sdk = new SuperfaceClient();

// Initialize Shopify API
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
  scopes: process.env.SCOPES.split(','),
  hostName: process.env.SHOPIFY_APP_HOST.replace(/^https?:\/\//, ''),
  apiVersion: ApiVersion.October23,
  isEmbeddedApp: true,
  accessMode: 'offline',
});

connectDB();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const corsOptions = {
  origin: (origin, callback) => {
    const allowedLocalhost = 'http://localhost:5175';
    const allowedCloudflarePattern = /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/;

    if (!origin || origin === allowedLocalhost || allowedCloudflarePattern.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions)); 

app.use(express.json());
app.use(morgan('dev'));

app.get('/auth', async (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send('Shop is required');
  const authRoute = await shopify.auth.beginAuth(req, res, shop, '/auth/callback', false);
  res.redirect(authRoute);
});

app.get('/auth/callback', async (req, res) => {
  try {
    const session = await shopify.auth.validateAuthCallback(req, res, req.query);
    const accessToken = session.accessToken;
    console.log(`Access token for ${session.shop}: ${accessToken}`);
    res.status(200).send('Authorization successful!');
  } catch (error) {
    console.error(`Error during authorization: ${error.message}`, error);
    res.status(500).send('Error during authorization');
  }
});

const geocodeLocation = async (loc) => {
  const profile = await sdk.getProfile('address/geocoding@3.1.2');
  const result = await profile.getUseCase('Geocode').perform(
    { query: loc },
    { provider: 'nominatim' }
  );
  return result.unwrap();
}

app.get('/api/geocode', async (req, res) => {
  try {
    const location = req.query.location;
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }
    const coordinates = await geocodeLocation(location);
    res.json({ location, coordinates });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post('/api/route', async (req, res) => {
  try {
    const { locations } = req.body;
    if (!Array.isArray(locations) || locations.length !== 2) {
      return res.status(422).json({ error: 'Expected 2 waypoints' });
    }
    const waypoints = await Promise.all(locations.map(location => geocodeLocation(location)));
    res.json({ waypoints });
  } catch (error) {
    res.status(500).json(error);
  }
});



app.use('/api/v1/shopify', shopifyRoutes);
app.use('/api/v1/category',categoryRoutes);
app.use('/api/v1/stores', StoreRoutes);

app.use("/api/v1/settings", settingsRoutes);
wss.on('connection', (ws) => {
  console.log('WebSocket connection established');
  ws.on('message', (message) => {
    console.log('Received message:', message);
    ws.send(`Received: ${message}`);
  });
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});
app.get('/', (req, res) => {
  res.send('<h1>Welcome to Mapify</h1>');
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('WebSocket connection established');
  
  ws.on('message', (message) => {
    console.log('Received message:', message);
    ws.send(`Received: ${message}`);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on ${process.env.DEV_MODE} mode on port ${PORT}.`);
});
