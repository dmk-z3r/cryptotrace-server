
import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { adminMiddleware } from '../middlewares/admin';

const router = Router();

router.post('/login', authController.login);
router.post('/request-access', authController.requestAccess);

router.post('/approve-reject-access-request', adminMiddleware, authController.approveRejectAccessRequest);


export default router;