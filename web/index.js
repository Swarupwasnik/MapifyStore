// import { join } from "path";
// import { readFileSync } from "fs";
// import express from "express";
// import serveStatic from "serve-static";
// import dotenv from 'dotenv';
// import cors from 'cors';
// import mongoose from 'mongoose';
// import shopify from "./shopify.js";
// import productCreator from "./product-creator.js";
// import PrivacyWebhookHandlers from "./privacy.js";
// import registerRoutes from "./routes/registerRoutes.js";

// dotenv.config();

// const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10);
// const STATIC_PATH = process.env.NODE_ENV === "production"
//   ? `${process.cwd()}/frontend/dist`
//   : `${process.cwd()}/frontend/`;

// const app = express();

// // MongoDB connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log("Mongo Error", err));

// app.use(express.json());
// app.use(cors());

// // Set up Shopify authentication and webhook handling
// app.get(shopify.config.auth.path, shopify.auth.begin());
// app.get(shopify.config.auth.callbackPath, shopify.auth.callback(), shopify.redirectToShopifyOrAppRoot());
// app.post(shopify.config.webhooks.path, shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers }));

// app.use("/api/*", shopify.validateAuthenticatedSession());

// // Use the registration routes
// app.use("/api", registerRoutes);

// // Shopify product-related routes (existing code)
// app.get("/api/products/count", async (_req, res) => {
//   const client = new shopify.api.clients.Graphql({
//     session: res.locals.shopify.session,
//   });
//   const countData = await client.request(`
//     query shopifyProductCount {
//       productsCount {
//         count
//       }
//     }
//   `);
//   res.status(200).send({ count: countData.data.productsCount.count });
// });

// app.post("/api/products", async (_req, res) => {
//   let status = 200;
//   let error = null;
//   try {
//     await productCreator(res.locals.shopify.session);
//   } catch (e) {
//     console.log(`Failed to process products/create: ${e.message}`);
//     status = 500;
//     error = e.message;
//   }
//   res.status(status).send({ success: status === 200, error });
// });

// app.use(shopify.cspHeaders());
// app.use(serveStatic(STATIC_PATH, { index: false }));

// // Serve the frontend
// app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
//   return res
//     .status(200)
//     .set("Content-Type", "text/html")
//     .send(
//       readFileSync(join(STATIC_PATH, "index.html"))
//         .toString()
//         .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
//     );
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });




import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

dotenv.config();

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10);
const STATIC_PATH = process.env.NODE_ENV === "production"
  ? `${process.cwd()}/frontend/dist`
  : `${process.cwd()}/frontend/`;

const app = express();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log("Mongo Error", err));

app.use(express.json());
app.use(cors());

app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(shopify.config.auth.callbackPath, shopify.auth.callback(), shopify.redirectToShopifyOrAppRoot());
app.post(shopify.config.webhooks.path, shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers }));

app.use("/api/*", shopify.validateAuthenticatedSession());

// Additional routes...

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res) => {
  return res.status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
