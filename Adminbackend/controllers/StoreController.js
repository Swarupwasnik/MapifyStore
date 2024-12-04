import { SuperfaceClient } from "@superfaceai/one-sdk";
import Category from "../models/CategoryModel.js";
import Store from "../models/StoreModel.js";
import moment from "moment";
import { retry } from "../services/retryService.js";
import mongoose from "mongoose";

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
        error: 'Invalid locations',
        details: 'Provide an array of exactly 2 locations'
      });
    }

    // Geocode Locations
    const waypoints = await Promise.all(
      locations.map(location => geocodeLocation(location, shop))
    );

    // Validate Waypoints
    const validWaypoints = waypoints.filter(wp => 
      wp.latitude && wp.longitude
    );

    if (validWaypoints.length < 2) {
      return res.status(404).json({
        error: 'Insufficient geocoding results',
        details: 'Could not find coordinates for provided locations'
      });
    }

    res.status(200).json({
      waypoints: validWaypoints,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'Nominatim'
      }
    });
  } catch (error) {
    console.error('Waypoints Error:', error);
    res.status(500).json({
      error: 'Waypoints Calculation Failed',
      details: error.message
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
      return res
        .status(400)
        .json({ error: "Some required fields are missing" });
    }

    // Geocode the location based on the city in the address
    const coordinates = await geocodeLocation(address.city);
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
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
        type: "Point",
        coordinates: [coordinates.longitude, coordinates.latitude], // GeoJSON format
      },
      workingHours,
      agreeToTerms,
      websiteURL,
      fax,
      additional,
      published: false,
    });

    await newStore.save();
    res.status(201).json(newStore);
  } catch (error) {
    console.error("Error adding store:", error);
    res
      .status(500)
      .json({ error: "Error adding store", details: error.message });
  }
};

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

export const getAllStores = async (req, res) => {
  try {
    const stores = await retry(() => Store.find().populate("category"));
    res.json(stores);
  } catch (error) {
    console.error("Error retrieving all stores:", error);
    res
      .status(500)
      .json({ error: "Error retrieving all stores", details: error.message });
  }
};

// export const getAllStores = async (req, res) => {
//   try {
//     const stores = await Store.find().populate("category");
//     res.json(stores);
//   } catch (error) {
//     console.error("Error retrieving all stores:", error);
//     res
//       .status(500)
//       .json({ error: "Error retrieving all stores", details: error.message });
//   }
// };

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
    const stores = await Store.find({ published: true }).populate(
      "category",
      "name"
    );
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch published stores" });
  }
};

export const getUnpublishedStores = async (req, res) => {
  try {
    const stores = await Store.find({ published: false });
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch unpublished stores" });
  }
};

export const getStoresByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    if (!status || (status !== "open" && status !== "close")) {
      return res
        .status(400)
        .json({ error: "Invalid status. Use 'open' or 'close'." });
    }

    const currentTime = moment();

    const stores = await Store.find();

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
