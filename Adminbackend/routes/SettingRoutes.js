import express from 'express';
import {
  createSettings,
  updateSettings,
  getSettings,
  deleteSettings
} from '../controllers/SettingsController.js';



const router = express.Router();

// Settings Routes
router.post('/settings1', createSettings);
router.put('/settings1', updateSettings);
router.get('/settings1', getSettings);
router.delete('/settings1', deleteSettings);

export default router;



// import express from 'express';
// import {
//   createSettings,
//   updateSettings,
//   getSettings,
//   deleteSettings
// } from '../controllers/SettingsController.js';
// import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';

// const router = express.Router();

// // Settings Routes
// router.post('/settings1', authenticateUser, authorizeRoles('admin', 'user'), createSettings);
// router.put('/settings1', authenticateUser, authorizeRoles('admin','user'), updateSettings); 
// router.get('/settings1', authenticateUser, getSettings);
// router.delete('/settings1', authenticateUser, authorizeRoles('admin'), deleteSettings); 

// export default router;


