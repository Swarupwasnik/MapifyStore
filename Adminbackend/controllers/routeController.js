import axios from "axios";
import OSRM from "osrm-client";
import Store from "../models/StoreModel.js";

const osrm = new OSRM("http://router.project-osrm.org"); // OSRM public server

export const geocodeLocation = async (loc) => {
  const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${loc}&format=json`);
  if (response.data.length === 0) throw new Error(`No coordinates found for ${loc}`);
  const { lat, lon } = response.data[0];
  return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
};

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

export const getWay = async (req, res) => {
  try {
    const { storeId, destination } = req.body;
    if (!storeId || !destination) {
      return res.status(422).json({ error: "Store ID and destination are required" });
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    const destinationCoordinates = await geocodeLocation(destination);

    const response = await osrm.route({
      coordinates: [
        [store.address.longitude, store.address.latitude],
        [destinationCoordinates.longitude, destinationCoordinates.latitude],
      ],
      overview: "full",
      geometries: "geojson",
    });

    const route = response.routes[0];
    res.json({
      waypoints: [
        { latitude: store.address.latitude, longitude: store.address.longitude },
        destinationCoordinates,
      ],
      route: route.geometry,
      distance: route.distance, // Distance in meters
      duration: route.duration, // Duration in seconds
    });
  } catch (error) {
    console.error("Error retrieving waypoints:", error);
    res.status(500).json({ error: "Error retrieving waypoints", details: error.message });
  }
};
