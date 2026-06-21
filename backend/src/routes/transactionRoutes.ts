import { Router } from 'express';
import { auth } from '../middleware/auth';
import { 
  createTransaction, 
  getTransactions, 
  updateTransaction, 
  deleteTransaction 
} from '../controllers/transactionController';

const router = Router();

// Rotas protegidas pelo middleware 'auth' e chamando apenas o Controller
router.post('/transactions', auth, createTransaction);
router.get('/transactions', auth, getTransactions);

// CORREÇÃO: Middleware auth adicionado e código duplicado removido!
router.put('/transactions/:id', auth, updateTransaction);
router.delete('/transactions/:id', auth, deleteTransaction);

export default router;