
import { Router } from 'express';
import * as networkAnalysisController from '../controllers/network-analysis.controller';

const router = Router();

router.get('/', networkAnalysisController.getNetworkAnalysis);

export default router;