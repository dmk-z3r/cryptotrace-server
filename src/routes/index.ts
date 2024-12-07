import { Router } from 'express';
import authRoutes from './auth.route';
import healthRoutes from './health.route';
import transactionRoutes from './transaction.route';
import searchRoutes from './search.route';
import databaseRoutes from './database.route';



const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/search', searchRoutes);
router.use('/transactions', transactionRoutes);
router.use('/databases', databaseRoutes);

export default router;