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
import locationRoutes from "./routes/locationRoutes.js";
import SettingRoutes from "./routes/SettingRoutes.js";
import AuthRoutes from "./routes/AuthRoutes.js";
import PaymentRoutes from "./routes/PaymentRoutes.js"
import initializeDefaultSettings from "./seed/initializeDefaultSettings.js";
import UserStoreRoute from "./routes/UserStoreRoute.js";
import Shop from "./models/Shop.js";
import ngrok from "ngrok"; // Import Ngrok

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

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5175",
      /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/,
      /^https:\/\/[a-z0-9-]+\.myshopify\.com$/,
    ];

    if (
      !origin ||
      allowedOrigins.some((o) =>
        typeof o === "string" ? o === origin : o.test(origin)
      )
    ) {
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

// Proxy middleware
app.use(
  "/apps/stores",
  createProxyMiddleware({
    target: "https://humanities-halifax-communications-hence.trycloudflare.com",
    changeOrigin: true,
    pathRewrite: {
      "^/apps/stores": "/apps/stores",
    },
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader(
        "Host",
        "https://humanities-halifax-communications-hence.trycloudflare.com"
      );
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log("Proxy Response Headers:", proxyRes.headers);
    },
    onError: (err, req, res) => {
      console.error("Proxy Error:", err);
      res.status(500).send("Proxy Error: " + err.message);
    },
    logLevel: "debug",
  })
);

// Utility function to wrap request object
function wrapRequest(req) {
  return {
    headers: req.headers || {},
    query: req.query || {},
    body: req.body || {},
    url: req.originalUrl || req.url || "",
    method: req.method || "GET",
  };
}

// Authorization routes
app.get("/auth", async (req, res) => {
  const shop = req.query.shop;
  if (!shop || !shop.match(/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/)) {
    return res.status(400).send("Invalid shop parameter");
  }

  try {
    const redirectUrl = await shopify.auth.begin({
      shop,
      callbackPath: "/auth/callback",
      isOnline: false,
      rawRequest: wrapRequest(req),
    });
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error during Shopify authentication:", error);
    res.status(500).send("Authentication initiation failed");
  }
});
app.get("/auth/callback", async (req, res) => {
  try {
    const wrappedReq = wrapRequest(req);
    const session = await shopify.auth.callback({
      rawRequest: wrappedReq,
      rawResponse: res,
    });

    if (!session) {
      console.error("No session found after callback.");
      return res.status(500).send("No session found.");
    }

    const accessToken = session.accessToken;
    console.log(`Access Token: ${accessToken}`);

    const shopDetails = await shopify.rest.Shop.fetch({
      session: { accessToken, shop: session.shop },
    });

    console.log("Shop Details:", shopDetails);

    const shopAdminDetails = {
      shop: session.shop,
      accessToken,
      shopOwner: shopDetails.shop_owner,
      email: shopDetails.email,
      storeName: shopDetails.name,
    };

    await Shop.findOneAndUpdate(
      { shop: session.shop },
      shopAdminDetails,
      { upsert: true, new: true },
      (err, doc) => {
        if (err) {
          console.error("Error saving to MongoDB:", err);
        } else {
          console.log("Document saved:", doc);
        }
      }
    );

    res.status(200).send("Authorization successful!");
  } catch (error) {
    console.error(`Error during authorization: ${error.message}`, error);
    console.error("Full error object:", error); // Log the full error object
    res.status(500).send("Error during authorization");
  }
});

// app.get("/auth/callback", async (req, res) => {
//   try {
//     const wrappedReq = wrapRequest(req);
//     const session = await shopify.auth.callback({
//       rawRequest: wrappedReq,
//       rawResponse: res,
//     });

//     if (!session) {
//       console.log('No session found');
//       return res.status(500).send('No session found');
//     }

//     const accessToken = session.accessToken;
//     console.log(`Access Token: ${accessToken}`);

//     const shopDetails = await shopify.rest.Shop.fetch({
//       session: { accessToken, shop: session.shop },
//     });
//     console.log("Shop Details:", shopDetails); 

//     const shopAdminDetails = {
//       shop: session.shop,
//       accessToken,
//       shopOwner: shopDetails.shop_owner,
//       email: shopDetails.email,
//       storeName: shopDetails.name,
//     };

//     await Shop.findOneAndUpdate({ shop: session.shop }, shopAdminDetails, {
//       upsert: true,
//       new: true,
//     }, (err, doc) => {
//       if (err) {
//         console.error("Error saving to MongoDB:", err);
//       } else {
//         console.log("Document saved:", doc);
//       }
//     });

//     res.status(200).send("Authorization successful!");
//   } catch (error) {
//     console.error(`Error during authorization: ${error.message}`, error);
//     res.status(500).send("Error during authorization");
//   }
// });


// Geocode API logic
const geocodeLocation = async (loc) => {
  const profile = await sdk.getProfile("address/geocoding@3.1.2");
  const result = await profile
    .getUseCase("Geocode")
    .perform({ query: loc }, { provider: "nominatim" });
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
app.use("/api/v1/stores", locationRoutes);
app.use("/api/v1/settings", SettingRoutes);
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/user",UserStoreRoute);
app.use("/api/v1/payments", PaymentRoutes);
app.use(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' })
);
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

// GDPR Compliance
const registerWebhooks = async (shop, accessToken) => {
  const registerWebhook = await shopify.webhook.register({
    session: { shop, accessToken },
    topic: "GDPR",
    address: `${process.env.SHOPIFY_APP_HOST}/webhook/gdpr`,
    format: "json",
  });

  if (!registerWebhook.success) {
    console.log(`Failed to register webhook: ${registerWebhook.result}`);
  }
};

app.post("/webhook/gdpr", async (req, res) => {
  const { topic, data } = req.body;

  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST":
      // Handle customer data request
      break;
    case "CUSTOMERS_REDACT":
      // Handle customer data erasure
      break;
    case "SHOP_REDACT":
      // Handle shop data erasure
      break;
  }

  res.status(200).send("Webhook received");
});

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Mapify</h1>");
});

// Define PORT at the beginning
const PORT = process.env.PORT || 5175;

// Start Ngrok tunnel
(async function () {
  try {
    const url = await ngrok.connect(PORT);
    console.log(`Ngrok tunnel established at ${url}`);
    process.env.SHOPIFY_APP_HOST = url.replace(/^https?:\/\//, "");

    server.listen(PORT, () => {
      console.log(
        `Server running on ${process.env.NODE_ENV} mode on port ${PORT}.`
      );
    });
  } catch (error) {
    console.error(`Error starting Ngrok: ${error.message}`);
  }
})();


// import { join } from "path";
// import { readFileSync } from "fs";
// import express from "express";
// import dotenv from "dotenv";
// import morgan from "morgan";
// import cors from "cors";
// import { createServer } from "http";
// import "@shopify/shopify-api/adapters/node";
// import connectDB from "./config/db.js";
// import { shopifyApi, ApiVersion } from "@shopify/shopify-api";
// import shopifyRoutes from "./routes/shopifyRoutes.js";
// import { SuperfaceClient } from "@superfaceai/one-sdk";
// import StoreRoutes from "./routes/StoreRoutes.js";
// import WebSocket, { WebSocketServer } from "ws";
// import categoryRoutes from "./routes/categoryRoutes.js";
// import { createProxyMiddleware } from "http-proxy-middleware";
// import locationRoutes from "./routes/locationRoutes.js";
// import SettingRoutes from "./routes/SettingRoutes.js";
// import AuthRoutes from "./routes/AuthRoutes.js";
// import { authenticateAdmin } from "./middleware/authMiddleware.js";
// import initializeDefaultSettings from "./seed/initializeDefaultSettings.js";
// import UserStoreRoute from "./routes/UserStoreRoute.js";
// import Shop from "./models/Shop.js";
// // import AuthRoutes from "./routes/AuthRoutes.js";
// dotenv.config();
// console.log("Environment variables loaded:", process.env);

// const sdk = new SuperfaceClient();

// // Initialize Shopify API
// const shopify = shopifyApi({
//   apiKey: process.env.SHOPIFY_API_KEY,
//   apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
//   scopes: process.env.SCOPES.split(","),
//   hostName: process.env.SHOPIFY_APP_HOST.replace(/^https?:\/\//, ""),
//   apiVersion: ApiVersion.October23,
//   isEmbeddedApp: true,
//   accessMode: "offline",
// });

// connectDB();

// const app = express();
// const server = createServer(app);
// const wss = new WebSocketServer({ server });

// const corsOptions = {
//   origin: (origin, callback) => {
//     const allowedOrigins = [
//       "http://localhost:5175",
//       /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/,
//       /^https:\/\/[a-z0-9-]+\.myshopify\.com$/,
//     ];

//     if (
//       !origin ||
//       allowedOrigins.some((o) =>
//         typeof o === "string" ? o === origin : o.test(origin)
//       )
//     ) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"],
// };

// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(morgan("dev"));
// // newly added

// // newlyadded

// // Proxy middleware
// app.use(
//   "/apps/stores",
//   createProxyMiddleware({
//     target: "https://humanities-halifax-communications-hence.trycloudflare.com",
//     changeOrigin: true,
//     pathRewrite: {
//       "^/apps/stores": "/apps/stores",
//     },
//     onProxyReq: (proxyReq, req, res) => {
//       proxyReq.setHeader(
//         "Host",
//         "https://humanities-halifax-communications-hence.trycloudflare.com"
//       );
//     },
//     onProxyRes: (proxyRes, req, res) => {
//       console.log("Proxy Response Headers:", proxyRes.headers);
//     },
//     onError: (err, req, res) => {
//       console.error("Proxy Error:", err);
//       res.status(500).send("Proxy Error: " + err.message);
//     },
//     logLevel: "debug",
//   })
// );

// // Authorization routes

// app.get("/auth", async (req, res) => {
//   const shop = req.query.shop;
//   if (!shop) {
//     return res.status(400).send("Shop is required");
//   }

//   try {
//     const authRoute = await shopify.auth.beginAuth(
//       req,
//       res,
//       shop,
//       "/auth/callback",
//       false
//     );
//     res.redirect(authRoute);
//   } catch (error) {
//     console.error(
//       `Error initiating Shopify authentication: ${error.message}`,
//       error
//     );
//     res.status(500).send("Error initiating authentication");
//   }
// });

// app.get("/auth/callback", async (req, res) => {
//   const { shop, code, hmac, state } = req.query;

//   if (!shop || !code || !hmac || !state) {
//     return res.status(400).send("Missing required parameters");
//   }

//   try {
//     const session = await shopify.auth.validateAuthCallback(
//       req,
//       res,
//       req.query
//     );
//     const accessToken = session.accessToken;
// // added
// await Shop.findOneAndUpdate(
//   { shop: session.shop },
//   { shop: session.shop, accessToken },
//   { upsert: true, new: true }
// );
// // added

//     console.log(`Access token for ${session.shop}: ${accessToken}`);
//     res.status(200).send("Authorization successful!");
//   } catch (error) {
//     console.error(`Error during authorization: ${error.message}`, error);
//     res.status(500).send("Error during authorization");
//   }
// });

// // Geocode API logic
// const geocodeLocation = async (loc) => {
//   const profile = await sdk.getProfile("address/geocoding@3.1.2");
//   const result = await profile
//     .getUseCase("Geocode")
//     .perform({ query: loc }, { provider: "nominatim" });
//   return result.unwrap();
// };

// app.get("/api/geocode", async (req, res) => {
//   try {
//     const location = req.query.location;
//     if (!location) {
//       return res.status(400).json({ error: "Location is required" });
//     }
//     const coordinates = await geocodeLocation(location);
//     res.json({ location, coordinates });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

// // Routes
// app.use("/api/v1/shopify", shopifyRoutes);
// app.use("/api/v1/category", categoryRoutes);
// app.use("/api/v1/stores", StoreRoutes);
// app.use("/api/v1/stores", locationRoutes);
// app.use("/api/v1/settings", SettingRoutes);
// app.use("/api/v1/auth", AuthRoutes);
// // WebSocket connection handling
// wss.on("connection", (ws) => {
//   console.log("WebSocket connection established");
//   ws.on("message", (message) => {
//     console.log("Received message:", message);
//     ws.send(`Received: ${message}`);
//   });
//   ws.on("close", () => {
//     console.log("WebSocket connection closed");
//   });
// });

// app.get("/", (req, res) => {
//   res.send("<h1>Welcome to Mapify</h1>");
// });

// const PORT = process.env.PORT || 5175;
// server.listen(PORT, () => {
//   console.log(
//     `Server running on ${process.env.DEV_MODE} mode on port ${PORT}.`
//   );
// });
