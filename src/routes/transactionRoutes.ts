// Adicione esta linha no topo do ficheiro
import { Transaction } from '../models/Transaction'; // ou o caminho correto para o seu modelo
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
// Rota para deletar uma transação
router.delete('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Transaction.findByIdAndDelete(id); // Lógica do Mongoose
    res.status(200).json({ message: 'Transação apagada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar transação' });
  }
});
router.put('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, type, category, date } = req.body;
    
    // Atualiza o documento no MongoDB e devolve o novo documento atualizado
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { description, amount, type, category, date },
      { new: true }
    );

    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar transação' });
  }
});
export default router;