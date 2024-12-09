import { Router } from 'express';
import { getTransactions, createTransaction, analyzeTransactionByHash, predictTransaction } from '../controllers/transaction.controller';


const router = Router();


router.get('/', getTransactions);
router.post('/', createTransaction);
router.get('/:hash/analyse', analyzeTransactionByHash);
router.get('/:address/predict', predictTransaction);


export default router;