
import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { adminMiddleware } from '../middlewares/admin';
import { jwtMiddleware, JWTRequest } from '../middlewares/jwt';

const router = Router();

router.post('/login', authController.login);
router.post('/request-access', authController.requestAccess);

router.get('/user', jwtMiddleware, (req, res) => authController.getUser(req as JWTRequest, res));
router.post('/approve-reject-access-request', adminMiddleware, authController.approveRejectAccessRequest);


export default router;