import { Router } from 'express';
import { getTransactions, createTransaction, analyzeTransactionByHash } from '../controllers/transaction.controller';


const router = Router();


router.get('/', getTransactions);
router.post('/', createTransaction);
router.get('/:hash/analyse', analyzeTransactionByHash);


export default router;