import { SuperfaceClient } from "@superfaceai/one-sdk";
import Category from "../models/CategoryModel.js";
import Shop from "../models/Shop.js";
import asyncHandler from 'express-async-handler';
import User from "../models/UserStoreModel.js";

const sdk = new SuperfaceClient();

async function geocodeLocation(loc) {
  const profile = await sdk.getProfile("address/geocoding@3.1.2");
  const result = await profile
    .getUseCase("Geocode")
    .perform({ query: loc }, { provider: "nominatim" });

  const data = result.unwrap();
  return data;
}

export const getCoordinates = async (req, res) => {
  try {
    const location = req.query.location;
    const coordinates = await geocodeLocation(location);
    res.json({ location, coordinates });
  } catch (error) {
    console.error("Error retrieving coordinates:", error);
    res.status(500).json({ error: "Error retrieving coordinates", details: error.message });
  }
};

export const getStoresWithCoordinates = async (req, res) => {
  try {
    const stores = await UserStoreModel.find().populate("category");

    const storesWithCoordinates = [];
    for (const store of stores) {
      try {
        const coordinates = await geocodeLocation(store.address.city);
        storesWithCoordinates.push({
          ...store.toObject(),
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        });
      } catch (error) {
        console.warn(`Failed to retrieve coordinates for store: ${store.name}`, error.message);
      }
    }

    res.json(storesWithCoordinates);
  } catch (error) {
    console.error("Error retrieving stores with coordinates:", error);
    res.status(500).json({ error: "Error retrieving stores with coordinates", details: error.message });
  }
};


export const addStore = asyncHandler(async (req, res) => {
  console.log('addStore controller');
  const user = req.user; // Get the authenticated user

  if (!user) {
    return res.status(400).json({ error: 'User not authenticated' });
  }

  try {
    const {
      company,
      name,
      email,
      phone,
      categoryId,
      address,
      workingHours,
      agreeToTerms,
      websiteURL,
      fax,
      additional,
    } = req.body;

    console.log('Received address:', address);

    // Required fields validation
    const missingFields = [];
    if (!company) missingFields.push('company');
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!phone || !phone.countryCode || !phone.number) missingFields.push('phone');
    if (!categoryId) missingFields.push('categoryId');
    if (!address || !address.street || !address.city || !address.state || !address.postalCode || !address.country) {
      missingFields.push('address');
    }
    if (!workingHours || !Array.isArray(workingHours) || workingHours.length !== 7) {
      missingFields.push('workingHours');
    }
    if (agreeToTerms === undefined) missingFields.push('agreeToTerms');

    if (missingFields.length > 0) {
      return res.status(400).json({ error: 'Some required fields are missing', fields: missingFields });
    }

    // Geocode the location based on the city in the address
    const coordinates = await geocodeLocation(address.city);
    console.log('Geocoded coordinates:', coordinates);

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Create the store with published defaulting to false
    const newStore = new UserStoreModel({
      company,
      name,
      email,
      phone,
      category: categoryId,
      address: {
        ...address,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
      location: {
        type: 'Point',
        coordinates: [coordinates.longitude, coordinates.latitude],
      },
      workingHours,
      agreeToTerms,
      websiteURL,
      fax,
      additional,
      published: false,
    });

    await newStore.save();

    // Add the store reference to the user
    if (!user.stores) {
      user.stores = [];
    }
    user.stores.push(newStore._id);
    await user.save();

    res.status(201).json(newStore);
  } catch (error) {
    console.error('Error adding store:', error);
    res.status(500).json({ error: 'Error adding store', details: error.message });
  }
});



export const getUserStores = asyncHandler(async (req, res) => {
  try {
    const user = req.user;

    // Log user object for debugging
    console.log("Authenticated user:", user);

    if (!user || !user.stores || user.stores.length === 0) {
      return res.status(400).json({ error: "No stores found for the user" });
    }

    const userStores = await UserStoreModel.find({ _id: { $in: user.stores } }).populate("category");
    
    // Log retrieved stores for debugging
    console.log("Retrieved user stores:", userStores);

    res.json(userStores);
  } catch (error) {
    console.error("Error retrieving user stores:", error);
    res.status(500).json({ error: "Error retrieving user stores", details: error.message });
  }
});








// import { SuperfaceClient } from "@superfaceai/one-sdk";
// import Category from "../models/CategoryModel.js";
// import UserStoreModel from "../models/UserStoreModel.js";
// import Shop from "../models/Shop.js"

// const sdk = new SuperfaceClient;

// export const getCoordinates = async (req, res) => {
//   try {
//     const location = req.query.location;
//     const coordinates = await geocodeLocation(location);
//     res.json({ location, coordinates });
//   } catch (error) {
//     console.error("Error retrieving coordinates:", error);
//     res
//       .status(500)
//       .json({ error: "Error retrieving coordinates", details: error.message });
//   }
// };

// export const getStoresWithCoordinates = async (req, res) => {
//     try {
//       const stores = await UserStoreModel.find().populate("category");
  
//       const storesWithCoordinates = [];
//       for (const store of stores) {
//         try {
//           const coordinates = await retry(() =>
//             geocodeLocation(store.address.city)
//           );
//           storesWithCoordinates.push({
//             ...store.toObject(),
//             latitude: coordinates.latitude,
//             longitude: coordinates.longitude,
//           });
//         } catch (error) {
//           console.warn(
//             `Failed to retrieve coordinates for store: ${store.name}`,
//             error.message
//           );
//         }
//       }
  
//       res.json(storesWithCoordinates);
//     } catch (error) {
//       console.error("Error retrieving stores with coordinates:", error);
//       res.status(500).json({
//         error: "Error retrieving stores with coordinates",
//         details: error.message,
//       });
//     }
//   };


// // Controller for adding a store
// export const addStore = async (req, res) => {
//     if (!req.session.shopData) {
//       return res.status(400).send("No shop data found in session");
//     }
    
//     const { shop, accessToken } = req.session.shopData; // Extracting shop data and access token from session
//     if (!shop) {
//       return res.status(400).send("No shop data found");
//     }
  
//     try {
//       const {
//         company,
//         name,
//         email,
//         phone,
//         categoryId,
//         address,
//         workingHours,
//         agreeToTerms,
//         websiteURL,
//         fax,
//         additional,
//       } = req.body;
  
//       // Required fields validation
//       if (
//         !company ||
//         !name ||
//         !email ||
//         !phone ||
//         !categoryId ||
//         !address ||
//         agreeToTerms === undefined
//       ) {
//         return res
//           .status(400)
//           .json({ error: "Some required fields are missing" });
//       }
  
//       // Geocode the location based on the city in the address
//       const coordinates = await geocodeLocation(address.city);
//       const category = await Category.findById(categoryId);
//       if (!category) {
//         return res.status(404).json({ error: "Category not found" });
//       }
  
//       // Create the store with published defaulting to false
//       const newStore = new UserStoreModel({
//         shop,
//         company,
//         name,
//         email,
//         phone,
//         category: categoryId,
//         address: {
//           ...address,
//           latitude: coordinates.latitude,
//           longitude: coordinates.longitude,
//         },
//         location: {
//           type: "Point",
//           coordinates: [coordinates.longitude, coordinates.latitude],
//         },
//         workingHours,
//         agreeToTerms,
//         websiteURL,
//         fax,
//         additional,
//         published: false,
//       });
  
//       await newStore.save();
  
//       // Fetch shop details from the Shop model
//       const shopDetails = await Shop.findOne({ shop });
  
//       // Return the newly created store and shop details
//       res.status(201).json({
//         newStore,
//         shopDetails: {
//           shop: shopDetails.shop,
//           accessToken: shopDetails.accessToken,
//         },
//       });
//     } catch (error) {
//       console.error("Error adding store:", error);
//       res
//         .status(500)
//         .json({ error: "Error adding store", details: error.message });
//     }
//   };
  

