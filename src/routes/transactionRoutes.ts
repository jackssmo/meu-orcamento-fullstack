import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController';

const router = Router();

router.post('/transactions', auth, createTransaction);
router.get('/transactions', auth, getTransactions);
router.patch('/transactions/:id', auth, updateTransaction);
router.delete('/transactions/:id', auth, deleteTransaction);

export default router;