import express from 'express';
import multer from 'multer';
import * as databaseController from '../controllers/database.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', databaseController.getAllDatabases);
router.get('/:id', databaseController.getDatabaseById);
router.post('/', upload.single('file'), databaseController.uploadDatabase);
router.delete('/:id', databaseController.deleteDatabase);

export default router;