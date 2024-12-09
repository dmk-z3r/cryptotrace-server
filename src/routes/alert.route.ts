import express from 'express';
import * as alertController from '../controllers/alert.controller';

const router = express.Router();

router.get('/', alertController.getAllAlerts);
router.get('/:id', alertController.getAlertById);
router.post('/', alertController.createAlert);
router.delete('/:id', alertController.deleteAlert);
router.patch('/:id/status', alertController.updateAlertStatus);

export default router;
