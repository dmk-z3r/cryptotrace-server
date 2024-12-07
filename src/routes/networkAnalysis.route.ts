
import { Router } from 'express';
import { getNetworkAnalysis } from '../controllers/networkAnalysis.controller';

const router = Router();

router.get('/', getNetworkAnalysis);

export default router;