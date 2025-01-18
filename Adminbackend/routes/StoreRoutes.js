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
  togglePublishStore,
  getPublishedStores,
  getUnpublishedStores,
  getStoresByStatus,
  getStoreById,
  getGeocode,
  fetchStoresByCategoryAndDistance,
  getStoresByCategoryAndStatus,
  getStoresByDistanceAndStatus,
   getFilteredStores,
  getStoresByFilters,
  CheckEmail
  ,getStoresByLocationAndStatus,
  getStoresByShop,
  getUserStores,
  getStoresByUserId,
  getAdminStores,
  getStoresCount,
  getUserStoresByAdmin
} from '../controllers/StoreController.js';
import { getWay } from '../controllers/routeController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', searchStoresByLocation);
router.get('/coordinates', getCoordinates);
router.get('/status', searchStoresByStatus);
router.get('/location', searchStoresByLocation);
router.get('/category', searchStoresByCategory);
router.get('/allstores', authenticateUser, authorizeRoles('admin'), getAllStores); // Admin only
router.get('/stores', getStoresWithCoordinates);
router.get('/stores-with-coordinates', getStoresWithCoordinates);
router.get('/store/:id', getStoreById);
router.post('/waypoints', getWaypoints);
router.post('/storelocations', getStoresWithCoordinates);
router.post('/addstore', authenticateUser, addStore);
router.put('/updatestore/:storeId', authenticateUser, updateStore);
router.delete('/deletestore/:storeId', authenticateUser, deleteStore);
router.put('/:id/publish', togglePublishStore);
router.get('/published', getPublishedStores);
router.get('/unpublished', getUnpublishedStores);
router.get('/status', getStoresByStatus);
router.get('/geocode', getGeocode);
router.get('/category-distance', fetchStoresByCategoryAndDistance);
router.get('/category-status', getStoresByCategoryAndStatus);
router.get('/by-distance', getStoresByDistanceAndStatus);
 router.get('/filter', getFilteredStores);
router.get('/location-category-status', getStoresByFilters);
router.get('/check-email',CheckEmail)
router.get("/location-status", getStoresByLocationAndStatus);
router.get('/user-stores', authenticateUser, getStoresByShop); 
router.get('/user/:userId', authenticateUser, getStoresByUserId);
router.get('/admin', authenticateUser, getAdminStores);
router.get('/me', authenticateUser, getUserStores);
router.get("/count", authenticateUser, getStoresCount); 
router.get("/user-stores/:userId", authenticateUser, authorizeRoles('admin'), getUserStoresByAdmin);

export default router;
