// server/services/geocodeService.js
import { SuperfaceClient } from '@superfaceai/one-sdk';
const sdk = new SuperfaceClient();

export const geocodeLocation = async (loc) => {
  const profile = await sdk.getProfile('address/geocoding@3.1.2');
  const result = await profile.getUseCase('Geocode').perform(
    { query: loc },
    { provider: 'nominatim' }
  );
  const data = result.unwrap();
  return data;
};
