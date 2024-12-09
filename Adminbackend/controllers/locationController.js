// import Store from "../models/StoreModel.js";

// export const findStoresByLocation = async (latitude, longitude, radius) => {
//   try {
//     const stores = await Store.find({
//       "location.coordinates": {
//         $geoWithin: {
//           $centerSphere: [[longitude, latitude], radius / 6378.1],
//         },
//       },
//       published: true,
//     }).populate("category", "name");
//     return stores;
//   } catch (error) {
//     console.error("Error fetching stores by location:", error);
//     throw error;
//   }
// };

import Store from '../models/StoreModel.js';

export const findStoresByLocation = async (latitude, longitude, radius, status) => {
  try {
    const today = new Date();
    const dayName = today.toLocaleString("en-US", { weekday: "long" });
    const currentTime = today.toTimeString().slice(0, 5);

    const query = {
      "location.coordinates": {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radius / 6378.1],
        },
      },
      published: true,
    };

    if (status === 'open') {
      query.$or = [
        {
          workingHours: {
            $elemMatch: {
              day: dayName,
              isOpen: true,
              start: { $lte: currentTime },
              end: { $gte: currentTime },
            },
          },
        },
        { isOpen: true }, 
      ];
    } else if (status === 'close') {
      query.$or = [
        {
          $nor: [
            {
              workingHours: {
                $elemMatch: {
                  day: dayName,
                  isOpen: true,
                  start: { $lte: currentTime },
                  end: { $gte: currentTime },
                },
              },
            },
          ],
        },
        { isOpen: false },
      ];
    }

    const stores = await Store.find(query).populate("category", "name");
    return stores;
  } catch (error) {
    console.error("Error fetching stores by location:", error);
    throw error;
  }
};

