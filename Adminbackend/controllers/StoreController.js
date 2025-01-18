import { SuperfaceClient } from "@superfaceai/one-sdk";
import Category from "../models/CategoryModel.js";
import Store from "../models/StoreModel.js";
import moment from "moment";
import { retry } from "../services/retryService.js";

const sdk = new SuperfaceClient();

export const getCoordinates = async (req, res) => {
  try {
    const location = req.query.location;
    const coordinates = await geocodeLocation(location);
    res.json({ location, coordinates });
  } catch (error) {
    console.error("Error retrieving coordinates:", error);
    res
      .status(500)
      .json({ error: "Error retrieving coordinates", details: error.message });
  }
};
export const getStoresWithCoordinates = async (req, res) => {
  try {
    const stores = await Store.find().populate("category");

    const storesWithCoordinates = [];
    for (const store of stores) {
      try {
        const coordinates = await retry(() =>
          geocodeLocation(store.address.city)
        );
        storesWithCoordinates.push({
          ...store.toObject(),
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        });
      } catch (error) {
        console.warn(
          `Failed to retrieve coordinates for store: ${store.name}`,
          error.message
        );
      }
    }

    res.json(storesWithCoordinates);
  } catch (error) {
    console.error("Error retrieving stores with coordinates:", error);
    res.status(500).json({
      error: "Error retrieving stores with coordinates",
      details: error.message,
    });
  }
};

export const getWaypoints = async (req, res) => {
  try {
    const { locations, shop } = req.body;

    // Validate Input
    if (!Array.isArray(locations) || locations.length !== 2) {
      return res.status(400).json({
        error: "Invalid locations",
        details: "Provide an array of exactly 2 locations",
      });
    }

    // Geocode Locations
    const waypoints = await Promise.all(
      locations.map((location) => geocodeLocation(location, shop))
    );

    // Validate Waypoints
    const validWaypoints = waypoints.filter(
      (wp) => wp.latitude && wp.longitude
    );

    if (validWaypoints.length < 2) {
      return res.status(404).json({
        error: "Insufficient geocoding results",
        details: "Could not find coordinates for provided locations",
      });
    }

    res.status(200).json({
      waypoints: validWaypoints,
      metadata: {
        timestamp: new Date().toISOString(),
        source: "Nominatim",
      },
    });
  } catch (error) {
    console.error("Waypoints Error:", error);
    res.status(500).json({
      error: "Waypoints Calculation Failed",
      details: error.message,
    });
  }
};

// export const getWaypoints = async (req, res) => {
//   try {
//     const locations = req.body.locations;
//     if (!Array.isArray(locations) || locations.length !== 2) {
//       return res.status(422).json({ error: "Expected 2 waypoints" });
//     }

//     const waypoints = await Promise.all(
//       locations.map((location) => geocodeLocation(location))
//     );
//     res.json({ waypoints });
//   } catch (error) {
//     console.error("Error retrieving waypoints:", error);
//     res
//       .status(500)
//       .json({ error: "Error retrieving waypoints", details: error.message });
//   }
// };

export const getGeocode = async (req, res) => {
  try {
    const location = req.query.location;
    if (!location) {
      return res.status(400).json({ error: "Location is required" });
    }
    const coordinates = await geocodeLocation(location);
    res.json({ location, coordinates });
  } catch (error) {
    console.error("Error in geocode controller:", error);
    res.status(500).json({ message: "Error fetching geocode data", error });
  }
};

// Geocoding helper function
async function geocodeLocation(loc) {
  const profile = await sdk.getProfile("address/geocoding@3.1.2");
  const result = await profile
    .getUseCase("Geocode")
    .perform({ query: loc }, { provider: "nominatim" });

  const data = result.unwrap();
  return data;
}
// newly update


export const addStore = async (req, res) => {
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

    // Log the user information
    console.log('User in addStore:', req.user);

    // Required fields validation
    if (
      !company ||
      !name ||
      !email ||
      !phone ||
      !categoryId ||
      !address ||
      agreeToTerms === undefined
    ) {
      return res.status(400).json({ error: 'Some required fields are missing' });
    }

    // Check if the user is an admin or a normal user
    const user = req.user;
    if (!user) {
      console.log('User object is undefined');
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    if (user.role !== 'admin' && user.role !== 'user') {
      console.log(`User role is not authorized: ${user.role}`);
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    // Geocode the location based on the city in the address
    const coordinates = await geocodeLocation(address.city);
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      // Handle the case where coordinates are not available
      console.log("Coordinates are not available");
      return res.status(400).json({ error: "Unable to find geolocation coordinates for address" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // --- Subscription-based store limits ---
    if (user.role === 'user') {
      let maxStores;
      switch (user.subscription) {
        case 'free':
          maxStores = 1;
          break;
        case 'pro':
          maxStores = 10;
          break;
        case 'enterprise':
          maxStores = 100;
          break;
        default:
          maxStores = 0; // Or handle as an error case
      }

      if(maxStores === 0) {
          return res.status(403).json({ error: 'Invalid subscription.' });
      }

      const storeCount = await Store.countDocuments({ user: user._id });
      if (storeCount >= maxStores) {
        return res.status(403).json({
          error: `You have reached the maximum number of stores allowed for your subscription plan (${user.subscription}).`,
        });
      }
    }

    // Create the store with published defaulting to false
    const newStore = new Store({
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
      user: user._id, // Corrected: Use 'user' instead of 'owner'
    });

    await newStore.save();
    res.status(201).json(newStore);
  } catch (error) {
    console.error('Error adding store:', error);
    res.status(500).json({ error: 'Error adding store', details: error.message });
  }
};


// export const addStore = async (req, res) => {
//   try {
//     const {
//       company,
//       name,
//       email,
//       phone,
//       categoryId,
//       address,
//       workingHours,
//       agreeToTerms,
//       websiteURL,
//       fax,
//       additional,
//     } = req.body;

//     // Log the user information
//     console.log('User in addStore:', req.user);

//     // Required fields validation
//     if (
//       !company ||
//       !name ||
//       !email ||
//       !phone ||
//       !categoryId ||
//       !address ||
//       agreeToTerms === undefined
//     ) {
//       return res.status(400).json({ error: 'Some required fields are missing' });
//     }

//     // Check if the user is an admin or a normal user
//     const user = req.user;
//     if (!user) {
//       console.log('User object is undefined');
//       return res.status(403).json({ error: 'Unauthorized role' });
//     }

//     if (user.role !== 'admin' && user.role !== 'user') {
//       console.log(`User role is not authorized: ${user.role}`);
//       return res.status(403).json({ error: 'Unauthorized role' });
//     }

//     // Geocode the location based on the city in the address
//     const coordinates = await geocodeLocation(address.city);
//       if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
//        // Handle the case where coordinates are not available
//        console.log("Coordinates are not available");
//        return res.status(400).json({ error: "Unable to find geolocation coordinates for address" });
//      }

//     const category = await Category.findById(categoryId);
//     if (!category) {
//       return res.status(404).json({ error: 'Category not found' });
//     }

//     // Create the store with published defaulting to false
//     const newStore = new Store({
//       company,
//       name,
//       email,
//       phone,
//       category: categoryId,
//       address: {
//         ...address,
//         latitude: coordinates.latitude,
//         longitude: coordinates.longitude,
//       },
//       location: {
//         type: 'Point',
//         coordinates: [coordinates.longitude, coordinates.latitude],
//       },
//       workingHours,
//       agreeToTerms,
//       websiteURL,
//       fax,
//       additional,
//       published: false,
//       user: user._id, // Corrected: Use 'user' instead of 'owner'
//     });

//     await newStore.save();
//     res.status(201).json(newStore);
//   } catch (error) {
//     console.error('Error adding store:', error);
//     res.status(500).json({ error: 'Error adding store', details: error.message });
//   }
// };


// update Store
export const updateStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const {
      company,
      name,
      email,
      phone,
      categoryId,
      address,
      workingHours,
      agreeToTerms,
    } = req.body;

    if (
      !company ||
      !name ||
      !email ||
      !phone ||
      !categoryId ||
      !address ||
      agreeToTerms === undefined
    ) {
      return res
        .status(400)
        .json({ error: "Some required fields are missing" });
    }

    const coordinates = await geocodeLocation(address.city);
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      {
        company,
        name,
        email,
        phone: {
          countryCode: phone.countryCode,
          number: phone.number,
        },
        category: categoryId,
        address: {
          ...address,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
        workingHours,
        agreeToTerms,
        websiteURL: req.body.websiteURL,
        fax: req.body.fax,
        additional: req.body.additional,
      },
      { new: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json(updatedStore);
  } catch (error) {
    console.error("Error updating store:", error);
    res
      .status(500)
      .json({ error: "Error updating store", details: error.message });
  }
};

export const deleteStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const deletedStore = await Store.findByIdAndDelete(storeId);
    if (!deletedStore)
      return res.status(404).json({ error: "Store not found" });
    res.json({ message: "Store deleted successfully", storeId });
  } catch (error) {
    console.error("Error deleting store:", error);
    res
      .status(500)
      .json({ error: "Error deleting store", details: error.message });
  }
};
// rightcode
// export const searchStoresByStatus = async (req, res) => {
//   try {
//     const { openStatus } = req.query;

//     // Check for valid openStatus input
//     if (!openStatus || (openStatus !== "open" && openStatus !== "close")) {
//       return res
//         .status(400)
//         .json({ error: "Invalid openStatus. Use 'open' or 'close'." });
//     }

//     // Fetch only published stores and categories
//     const stores = await Store.find({ published: true })
//       .populate({
//         path: "category",
//         match: { published: true }, // Ensure only published categories are included
//         select: "name",
//       })
//       .exec();

//     // Filter stores to exclude those with no category (due to unpublished categories)
//     const validStores = stores.filter((store) => store.category);

//     // Further filter based on openStatus
//     const filteredStores = validStores.filter((store) =>
//       openStatus === "open" ? store.isStoreOpen() : !store.isStoreOpen()
//     );

//     // If no stores match, return a 404 response
//     if (filteredStores.length === 0) {
//       return res
//         .status(404)
//         .json({ error: "No stores found with the specified open status" });
//     }

//     // Return the filtered stores
//     res.json(filteredStores);
//   } catch (error) {
//     console.error("Error in searchStoresByStatus:", error);
//     res.status(500).json({ error: error.message });
//   }
// };
// rightcode

export const searchStoresByStatus = async (req, res) => {
  try {
    const { openStatus } = req.query;

    const stores = await Store.find({ published: true }).populate(
      "category",
      "name"
    );

    const filteredStores = stores.filter((store) =>
      openStatus === "open" ? store.isStoreOpen() : !store.isStoreOpen()
    );

    if (filteredStores.length === 0) {
      return res
        .status(404)
        .json({ error: "No stores found with the specified open status" });
    }

    res.json(filteredStores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchStoresByLocation = async (req, res) => {
  try {
    const { location } = req.query;
    if (!location)
      return res.status(400).json({ error: "Location is required" });

    const coordinates = await geocodeLocation(location);
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      return res.status(404).json({ error: "Location not found" });
    }

    const stores = await Store.find({
      "address.latitude": coordinates.latitude,
      "address.longitude": coordinates.longitude,
    }).populate("category", "name");
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchStoresByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    const categoryData = await Category.findOne({
      name: { $regex: category, $options: "i" },
    });
    if (!categoryData)
      return res.status(404).json({ error: "Category not found" });

    const stores = await Store.find({
      category: categoryData._id,
      published: true,
    }).populate("category", "name");

    if (stores.length === 0) {
      return res
        .status(404)
        .json({ error: "No published stores found for this category" });
    }

    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// added
// export const getAllStores = async (req, res) => {
//   try {
//     const stores = await retry(() => Store.find().populate("category"));
//     res.json(stores);
//   } catch (error) {
//     console.error("Error retrieving all stores:", error);
//     res
//       .status(500)
//       .json({ error: "Error retrieving all stores", details: error.message });
//   }
// };

// added
export const togglePublishStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    await Store.updateOne(
      { _id: req.params.id },
      { published: req.body.published }
    );

    res.status(200).json({
      message: `Store ${
        req.body.published ? "published" : "unpublished"
      } successfully`,
    });
  } catch (error) {
    console.error("Error updating store publish status:", error);
    res.status(500).json({ error: "Failed to update store publish status" });
  }
};

export const getPublishedStores = async (req, res) => {
  try {
    const stores = await Store.find({ published: true })
      .populate({
        path: "category",
        match: { published: true },
        select: "name",
      })
      .lean();

    const filteredStores = stores.filter((store) => store.category !== null);

    res.status(200).json(filteredStores);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch published stores" });
  }
};
export const getUnpublishedStores = async (req, res) => {
  try {
    const stores = await Store.find({ published: false })
      .populate({
        path: "category",
        select: "name",
      })
      .lean();

    const filteredStores = stores.filter((store) => store.category !== null);

    res.status(200).json(filteredStores);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch unpublished stores" });
  }
};

// right code
// export const getStoresByStatus = async (req, res) => {
//   try {
//     const { status } = req.query;

//     if (!status || (status !== "open" && status !== "close")) {
//       return res
//         .status(400)
//         .json({ error: "Invalid status. Use 'open' or 'close'." });
//     }

//     const currentTime = moment();

//     // Fetch stores that are published and have published categories
//     const stores = await Store.find({ published: true })
//       .populate({
//         path: "category",
//         match: { published: true }, // Only include published categories
//         select: "name",
//       })
//       .lean();

//     // Filter out stores that do not have a published category
//     const filteredStores = stores.filter((store) => store.category !== null);

//     // Further filter based on open/close status
//     const finalStores = filteredStores.filter((store) => {
//       const { openTime, closeTime } = store.workingHours;
//       const storeOpenTime = moment(openTime, "HH:mm");
//       const storeCloseTime = moment(closeTime, "HH:mm");

//       const isOpen = currentTime.isBetween(storeOpenTime, storeCloseTime);

//       return status === "open" ? isOpen : !isOpen;
//     });

//     res.status(200).json({ status, stores: finalStores });
//   } catch (error) {
//     console.error("Error fetching store list:", error);
//     res
//       .status(500)
//       .json({ error: "Error fetching store list", details: error.message });
//   }
// };
// rightcode
export const getStoresByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    if (!status || (status !== "open" && status !== "close")) {
      return res
        .status(400)
        .json({ error: "Invalid status. Use 'open' or 'close'." });
    }

    const currentTime = moment();

    const stores = await Store.find({});

    const filteredStores = stores.filter((store) => {
      const { openTime, closeTime } = store.workingHours;
      const storeOpenTime = moment(openTime, "HH:mm");
      const storeCloseTime = moment(closeTime, "HH:mm");

      const isOpen = currentTime.isBetween(storeOpenTime, storeCloseTime);

      return status === "open" ? isOpen : !isOpen;
    });

    res.status(200).json({ status, stores: filteredStores });
  } catch (error) {
    console.error("Error fetching store list:", error);
    res
      .status(500)
      .json({ error: "Error fetching store list", details: error.message });
  }
};

export const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res
        .status(404)
        .json({ error: "Store not found" })
        .populate("category", "name");
    }
    res.json(store);
  } catch (error) {
    console.error("Error fetching store by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const fetchStoresByCategoryAndDistance = async (req, res) => {
  try {
    const { categoryId, latitude, longitude, distance } = req.query;

    // Validate inputs
    if (!categoryId || !latitude || !longitude || !distance) {
      return res
        .status(400)
        .json({ error: "All query parameters are required" });
    }

    const radiusInMeters = Number(distance) * 1000; // Convert km to meters

    // Query stores
    const stores = await Store.find({
      category: categoryId,
      "address.latitude": { $exists: true },
      "address.longitude": { $exists: true },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: radiusInMeters,
        },
      },
    }).populate("category"); // Populate category details

    if (!stores || stores.length === 0) {
      return res.status(404).json({ message: "No stores found" });
    }

    res.status(200).json({ stores });
  } catch (error) {
    console.error("Error fetching stores by category and distance:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getStoresByCategoryAndStatus = async (req, res) => {
  const { shop, categoryName, openStatus } = req.query;

  // Ensure categoryName is provided in the request
  if (!categoryName) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    // Find the category ID based on the provided category name
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const query = {
      shop: shop,
      category: category._id,
      published: true,
    };

    console.log("Constructed Query:", query);

    // Fetch stores based on the query
    let stores = await Store.find(query).populate("category", "name");

    console.log("Fetched Stores:", stores);

    if (!stores.length) {
      console.warn("No stores found for the given criteria.");
      return res.status(404).json({ error: "No stores found" });
    }

    if (openStatus) {
      const isOpen = openStatus === "open";
      console.log(
        `Filtering stores for openStatus=${openStatus}, isOpen=${isOpen}`
      );

      stores = stores.filter((store) => store.isStoreOpen() === isOpen);

      console.log("Stores after filtering by openStatus:", stores);
    }

    res.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res
      .status(500)
      .json({ error: "Error fetching stores", details: error.message });
  }
};

export const getStoresByDistanceAndStatus = async (req, res) => {
  const { latitude, longitude, distance = 1000 } = req.query;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ message: "Latitude and Longitude are required." });
  }

  try {
    const maxDistance = parseFloat(distance) * 1000; // Convert km to meters

    // Fetch stores within the distance range
    const stores = await Store.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: maxDistance,
        },
      },
    });

    const openStores = [];
    const closedStores = [];

    stores.forEach((store) => {
      if (store.isStoreOpen()) {
        openStores.push(store);
      } else {
        closedStores.push(store);
      }
    });

    res.status(200).json({
      openStores,
      closedStores,
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ message: "Failed to fetch stores.", error });
  }
};
// newcode
// export const getFilteredStores = async (req, res) => {
//   try {
//       const { latitude, longitude, radius, category, status } = req.query;

//       // Find category by name if category is provided
//       let categoryId = null;
//       if (category) {
//           const foundCategory = await Category.findOne({ name: category });
//           if (foundCategory) {
//               categoryId = foundCategory._id;
//           } else {
//               return res.status(404).json({ error: "Category not found" });
//           }
//       }

//       const query = {
//           "location.coordinates": {
//               $geoWithin: {
//                   $centerSphere: [[longitude, latitude], radius / 6378.1],
//               },
//           },
//           category: categoryId, // Match by category ID
//           published: true,
//       };

//       if (status === "open" || status === "closed") {
//           query["workingHours"] = { $exists: true };
//       }

//       const stores = await Store.find(query).populate("category", "name");
//       const filteredStores = stores.filter((store) => {
//           const isOpen = store.isStoreOpen();
//           return status === "open" ? isOpen : !isOpen;
//       });

//       res.json(filteredStores);
//   } catch (error) {
//       console.error("Error fetching stores by filters:", error);
//       res.status(500).json({ error: "Failed to fetch stores" });
//   }
// };
export const getFilteredStores = async (req, res) => {
  try {
    const { latitude, longitude, radius, category, status } = req.query;

    // Validate latitude and longitude
    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    // Convert latitude and longitude to numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Invalid latitude or longitude" });
    }

    // Find category by name if provided
    let categoryId = null;
    if (category) {
      const foundCategory = await Category.findOne({ name: category });
      if (foundCategory) {
        categoryId = foundCategory._id;
      } else {
        return res.status(404).json({ error: "Category not found" });
      }
    }

    // Base query for geospatial filtering
    const query = {
      "location.coordinates": {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius / 6378.1],
        },
      },
      published: true,
    };

    // Add category filter if applicable
    if (categoryId) {
      query.category = categoryId;
    }

    // Fetch stores within the distance and category
    const stores = await Store.find(query).populate("category", "name");

    // Get current day and time
    const today = new Date();
    const dayName = today.toLocaleString("en-US", { weekday: "long" });
    const currentTime = today.toTimeString().slice(0, 5);

    // Filter stores based on status
    const filteredStores = stores.filter((store) => {
      const workingHours = store.workingHours || [];
      const todayHours = workingHours.find((hours) => hours.day === dayName);

      if (!todayHours || !todayHours.isOpen) {
        // If no working hours for today or the store is closed all day
        return status === "closed";
      }

      // Check if the store is currently open
      const isOpen =
        currentTime >= todayHours.start && currentTime <= todayHours.end;

      return status === "open" ? isOpen : !isOpen;
    });

    // Respond with the filtered stores
    res.json(filteredStores);
  } catch (error) {
    console.error("Error fetching stores by filters:", error);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
};

// newcode

// Filter stores based on query parameters

export const getStoresByFilters = async (req, res) => {
  const { location, category, status } = req.query;

  try {
    // Find the category by name
    const categoryData = await Category.findOne({ name: category });
    if (!categoryData) {
      return res.status(404).json({ error: "Category not found" });
    }

    const categoryId = categoryData._id; // Get the ObjectId of the category

    // Split the location into parts (city, state, country)
    const locationParts = location.split(",").map((part) => part.trim());
    const city = locationParts[0] || "";
    const state = locationParts[1] || "";
    const country = locationParts[2] || "";

    // Build the query
    const query = {
      published: true, // Ensure the store is published
      category: categoryId, // Use the ObjectId for the category
    };

    if (city) {
      query["address.city"] = { $regex: city, $options: "i" }; // Match city
    }
    if (state) {
      query["address.state"] = { $regex: state, $options: "i" }; // Match state
    }
    if (country) {
      query["address.country"] = { $regex: country, $options: "i" }; // Match country
    }

    const stores = await Store.find(query).populate("category");

    // Filter by status if needed
    const filteredStores = stores.filter((store) => {
      return status === "open" ? store.isStoreOpen() : !store.isStoreOpen();
    });

    res.status(200).json(filteredStores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const CheckEmail = async (req, res) => {
  const email = req.query.email;
  const store = await Store.findOne({ email });
  if (store) {
    res.json({ exists: true });
  } else {
    res.json({ exists: false });
  }
};

export const getStoresByLocationAndStatus = async (req, res) => {
  try {
    const { location, status } = req.query;

    // Validate location
    if (!location) {
      return res.status(400).json({ error: "Location is required" });
    }

    // Query based on location name (e.g., city or state)
    const locationQuery = {
      $or: [
        { "address.city": { $regex: location, $options: "i" } },
        { "address.state": { $regex: location, $options: "i" } },
      ],
      published: true,
    };

    // Fetch stores matching the location query, and populate category name
    const stores = await Store.find(locationQuery).populate("category", "name");

    // Get current day and time
    const today = new Date();
    const dayName = today.toLocaleString("en-US", { weekday: "long" });
    const currentTime = today.toTimeString().slice(0, 5);

    // Filter stores based on status
    const filteredStores = stores.filter((store) => {
      const workingHours = store.workingHours || [];
      const todayHours = workingHours.find((hours) => hours.day === dayName);

      if (!todayHours || !todayHours.isOpen) {
        // If no working hours for today or the store is closed all day
        return status === "closed";
      }

      // Check if the store is currently open
      const isOpen =
        currentTime >= todayHours.start && currentTime <= todayHours.end;

      return status === "open" ? isOpen : !isOpen;
    });

    // Respond with the filtered stores, including category name
    res.json(filteredStores);
  } catch (error) {
    console.error("Error fetching stores by location and status:", error);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
};

export const getStoresByShop = async (req, res) => {
  try {
    const { shop } = req.query; // Pass shop identifier as a query parameter

    if (!shop) {
      return res.status(400).json({ error: "Shop identifier is required" });
    }

    const stores = await Store.find({ shop }).populate("category");

    res.status(200).json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res
      .status(500)
      .json({ error: "Error fetching stores", details: error.message });
  }
};

// latest updated code

// controllers/StoreController.
// export const getUserStores = async (req, res) => {
//   try {
//     const user = req.user;

//     if (!user) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     const { category } = req.query;
//     const filter = { user: user._id };

//     if (category) {
//       const stores = await Store.find(filter)
//         .populate({
//           path: 'category',
//           match: { name: category },
//           select: 'name' 
//         })
//         .exec();

//       const filteredStores = stores.filter(store => store.category !== null);

//       return res.status(200).json(filteredStores);
//     } else {
//       const stores = await Store.find(filter).populate('category', 'name').exec();
//       return res.status(200).json(stores);
//     }
//   } catch (error) {
//     console.error('Error getting user stores:', error);
//     res.status(500).json({ error: 'Error getting user stores', details: error.message });
//   }
// };

// export const getUserStores = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     const { category, status } = req.query; // Accept 'status' as a query parameter
//     const filter = { user: user._id };

//     if (category) {
//       // Find the category by name to get its ID
//       const categoryDoc = await Category.findOne({ name: category });
//       if (!categoryDoc) {
//         return res.status(404).json({ error: 'Category not found' });
//       }
//       filter.category = categoryDoc._id;
//     }

//     let stores = await Store.find(filter).populate('category', 'name').exec();

//     if (status) {
//       const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' });
//       const currentTime = new Date().toTimeString().split(' ')[0]; // Get the current time in HH:mm format

//       stores = stores.filter((store) => {
//         const workingDay = store.workingHours.find((day) => day.day === currentDay);

//         if (!workingDay || !workingDay.isOpen) return status === 'closed';

//         const isOpen = currentTime >= workingDay.start && currentTime <= workingDay.end;
//         return status === 'open' ? isOpen : !isOpen;
//       });
//     }

//     res.status(200).json(stores);
//   } catch (error) {
//     console.error('Error getting user stores:', error);
//     res.status(500).json({ error: 'Error getting user stores', details: error.message });
//   }
// };


export const getUserStores = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { category, status, city } = req.query; // Accept 'city' as a query parameter
    const filter = { user: user._id };

    if (category) {
      // Find the category by name to get its ID
      const categoryDoc = await Category.findOne({ name: category });
      if (!categoryDoc) {
        return res.status(404).json({ error: 'Category not found' });
      }
      filter.category = categoryDoc._id;
    }

    if (city) {
      // Add city filter
      filter['address.city'] = city;
    }

    let stores = await Store.find(filter).populate('category', 'name').exec();

    if (status) {
      const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' });
      const currentTime = new Date().toTimeString().split(' ')[0]; // Get the current time in HH:mm format

      stores = stores.filter((store) => {
        const workingDay = store.workingHours.find((day) => day.day === currentDay);

        if (!workingDay || !workingDay.isOpen) return status === 'closed';

        const isOpen = currentTime >= workingDay.start && currentTime <= workingDay.end;
        return status === 'open' ? isOpen : !isOpen;
      });
    }

    res.status(200).json(stores);
  } catch (error) {
    console.error('Error getting user stores:', error);
    res.status(500).json({ error: 'Error getting user stores', details: error.message });
  }
};


// controllers/StoreController.js

export const getAllStores = async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const stores = await Store.find();
    res.status(200).json(stores);
  } catch (error) {
    console.error('Error getting all stores:', error);
    res.status(500).json({ error: 'Error getting all stores', details: error.message });
  }
};

// controllers/StoreController.js
export const getStoresByUserId = async (req, res) => {
  try {
    const user = req.user;
    const { userId } = req.params; // Get the user ID from the URL params

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const stores = await Store.find({ user: userId });
    res.status(200).json(stores);
  } catch (error) {
    console.error('Error getting stores by user ID:', error);
    res.status(500).json({ error: 'Error getting stores by user ID', details: error.message });
  }
};
// controllers/StoreController.js
export const getAdminStores = async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const stores = await Store.find({ user: user._id });
    res.status(200).json(stores);
  } catch (error) {
    console.error('Error getting admin stores:', error);
    res.status(500).json({ error: 'Error getting admin stores', details: error.message });
  }
};


export const getUserStoresByCategory = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { category } = req.query; // Assuming category is passed as a query parameter

    // Build the query object
    const query = { user: user._id };
    if (category) {
      query.category = category; // Adjust this field name based on your schema
    }

    const stores = await Store.find(query);
    res.status(200).json(stores);
  } catch (error) {
    console.error('Error getting user stores by category:', error);
    res.status(500).json({ error: 'Error getting user stores by category', details: error.message });
  }
};

export const getStoresCount = async (req, res) => {
  try {
    const user = req.user; // Assuming user is set in the request (middleware)
    if (!user) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    let storeCount;
    if (user.role === 'admin') {
      // If the user is an admin, return the count of all stores
      storeCount = await Store.countDocuments();
    } else {
      // For normal users, count stores added by the user
      storeCount = await Store.countDocuments({ user: user._id });
    }

    res.status(200).json({ count: storeCount });
  } catch (error) {
    console.error("Error fetching store count:", error);
    res.status(500).json({ error: "Error fetching store count" });
  }
};
export const getUserStoresByAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;
    const stores = await Store.find({ user: userId });
    res.json(stores);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stores", error: error.message });
  }
};