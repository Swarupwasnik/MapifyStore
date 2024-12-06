import Store from "../models/StoreModel.js";





export const findStoresByLocation = async (latitude, longitude, radius) => {
  try {
    const stores = await Store.find({
      'location.coordinates': {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radius / 6378.1]
        }
      },
      published:true
    }).populate("category","name")
    return stores;
  } catch (error) {
    console.error('Error fetching stores by location:', error);
    throw error;
  }
};
