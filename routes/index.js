/*eslint-disable*/
import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const router = Router();

// App controller
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// User controller
router.post('/users', UsersController.postNew);

export default router;