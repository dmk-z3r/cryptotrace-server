import express from 'express';
import * as reportController from '../controllers/report.controller';

const router = express.Router();

router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);
router.delete('/:id', reportController.deleteReport);
router.patch('/:id/status', reportController.updateReportStatus);

export default router;