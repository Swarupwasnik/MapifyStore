import Store from "../models/StoreModel.js";

export const findStoresByLocation = async (latitude, longitude, radius) => {
  try {
    const stores = await Store.find({
      "location.coordinates": {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radius / 6378.1],
        },
      },
      published: true,
    }).populate("category", "name");
    return stores;
  } catch (error) {
    console.error("Error fetching stores by location:", error);
    throw error;
  }
};


export const getStoresByStatusAndDistance = async (req, res) => {
  try {
    const {
      openStatus,  // 'open' or 'close'
      shop,        // Shop identifier
      latitude,    // User's latitude
      longitude,   // User's longitude
      minDistance, // Minimum distance (optional, default 0)
      maxDistance  // Maximum distance 
    } = req.query;

    // Validate required parameters
    if (!shop || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters"
      });
    }

    const userLatitude = parseFloat(latitude);
    const userLongitude = parseFloat(longitude);
    const minDistanceKm = minDistance ? parseFloat(minDistance) : 0;
    const maxDistanceKm = maxDistance ? parseFloat(maxDistance) : 1000;

    // Fetch stores from the database
    const query = { shop: shop, published: true };
    const stores = await Store.find(query).populate('category', 'name');

    // Filter stores based on distance
    const filteredStores = stores.filter(store => {
      if (!store.address?.latitude || !store.address?.longitude) {
        return false;
      }

      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        store.address.latitude,
        store.address.longitude
      );

      return distance >= minDistanceKm && distance <= maxDistanceKm;
    });

    // Filter stores based on open/close status
    const finalFilteredStores = filteredStores.filter(store => {
      if (!store.workingHours || !Array.isArray(store.workingHours)) {
        return openStatus === 'close'; // If no working hours, consider it closed
      }

      const today = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
      const todayHours = store.workingHours.find(
        day => day.day.toLowerCase() === today
      );

      if (!todayHours || !todayHours.isOpen) {
        return openStatus === 'close';
      }

      const customTime = todayHours.customTimes?.find(
        custom => custom.date?.toDateString() === new Date().toDateString()
      );

      const openTime = customTime?.start || todayHours.start;
      const closeTime = customTime?.end || todayHours.end;
      const currentTime = new Date().toTimeString().slice(0, 5);

      return openStatus === 'open'
        ? (currentTime >= openTime && currentTime <= closeTime)
        : !(currentTime >= openTime && currentTime <= closeTime);
    });

    // Prepare response
    res.status(200).json({
      success: true,
      totalStores: finalFilteredStores.length,
      stores: finalFilteredStores.map(store => ({
        id: store._id,
        name: store.name,
        company: store.company,
        address: store.address,
        phone: store.phone,
        email: store.email,
        websiteURL: store.websiteURL,
        category: store.category,
        workingHours: store.workingHours,
        status: store.status,
        distance: calculateDistance(
          userLatitude,
          userLongitude,
          store.address.latitude,
          store.address.longitude
        )
      }))
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
