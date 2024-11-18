

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
  togglePublishStore,getPublishedStores,getUnpublishedStores
} from '../controllers/StoreController.js';
const router = express.Router();

router.get('/coordinates', getCoordinates);
router.get('/status', searchStoresByStatus);
router.get('/location', searchStoresByLocation);
router.get('/category', searchStoresByCategory);
router.get('/allstores', getAllStores);
router.get('/stores', getStoresWithCoordinates);

router.post('/addstore', addStore);  
router.put('/updatestore/:storeId', updateStore);
router.delete('/deletestore/:storeId',  deleteStore);
router.put('/:id/publish',  togglePublishStore);
router.get('/published', getPublishedStores);
router.get('/unpublished', getUnpublishedStores);
export default router;








