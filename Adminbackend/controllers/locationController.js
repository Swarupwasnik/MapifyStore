import Store from "../models/StoreModel.js";
// export const findStoresByLocation = async (latitude, longitude, radius, category = null, openStatus = null) => {
//   try {
//     // Build the query object
//     const query = {
//       'location.coordinates': {
//         $geoWithin: {
//           $centerSphere: [[longitude, latitude], radius / 6378.1]
//         }
//       },
//       published: true
//     };

//     // Add category filter if provided
//     if (category) {
//       query.category = category; // Assuming category is a reference ID in your Store model
//     }

//     // Add open status filter if provided
//     if (openStatus) {
//       const isOpen = openStatus === 'open'; // Adjust based on your open status logic
//       query.open = isOpen; // Assuming you have an 'open' field in your Store model
//     }

//     // Fetch stores with the constructed query
//     const stores = await Store.find(query).populate("category", "name");
//     return stores;
//   } catch (error) {
//     console.error('Error fetching stores by location:', error);
//     throw error;
//   }
// };

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
