

import express from 'express';
import {
  getCoordinates,
  getWaypoints,
  getStoresWithCoordinates,
  addStore,
  updateStore,
  deleteStore,
  searchStoresByStatus,
  searchStoresByLocation,
  searchStoresByCategory,
  getAllStores,
  togglePublishStore,getPublishedStores,getUnpublishedStores,getStoresByStatus,getStoreById,getGeocode
 
} from '../controllers/StoreController.js';
import { getWay } from '../controllers/routeController.js';
const router = express.Router();


router.get('/search', searchStoresByLocation);

router.get('/coordinates', getCoordinates);
router.get('/status', searchStoresByStatus);
router.get('/location', searchStoresByLocation);
router.get('/category', searchStoresByCategory);
router.get('/allstores', getAllStores);
router.get('/stores', getStoresWithCoordinates);
router.get("/stores-with-coordinates", getStoresWithCoordinates);
router.get('/store/:id',getStoreById);
router.post("/waypoints",getWaypoints);
router.post("/storelocations",getStoresWithCoordinates)
router.post('/addstore', addStore);  
router.put('/updatestore/:storeId', updateStore);
router.delete('/deletestore/:storeId',  deleteStore);
router.put('/:id/publish',  togglePublishStore);
router.get('/published', getPublishedStores);
router.get('/unpublished', getUnpublishedStores);
router.get('/status', getStoresByStatus);
router.get('/geocode', getGeocode);


export default router;








