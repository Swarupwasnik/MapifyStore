
import { SuperfaceClient } from "@superfaceai/one-sdk";

const geocodeCache = new Map();
const sdk = new SuperfaceClient();

export const geocodeLocation = async (location) => {
  // Check if the location is cached
  if (geocodeCache.has(location)) {
    return geocodeCache.get(location);
  }

  const profile = await sdk.getProfile("address/geocoding@3.1.2");

  try {
    const result = await profile
      .getUseCase("Geocode")
      .perform({ query: location }, { provider: "nominatim" });

    const data = result.unwrap();

    // Cache the result
    geocodeCache.set(location, data);
    return data;
  } catch (error) {
    console.error(`Failed to geocode location: ${location}`, error.message);
    throw error;
  }
};
