import { Response } from 'express';
import { Transaction } from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = new Transaction({
      ...req.body,
      owner: req.user?.userId
    });
    
    await transaction.save();
    res.status(201).send(transaction);
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(400).send(error);
  }
};

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find({ owner: req.user?.userId });
    res.send(transactions);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).send(error);
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactionId = req.params.id;
    const userId = req.user?.userId;
    const updates = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, owner: userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      res.status(404).send({ error: 'Transação não encontrada.' });
      return;
    }

    res.send(transaction);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(400).send(error);
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactionId = req.params.id;
    const userId = req.user?.userId;

    const transaction = await Transaction.findOneAndDelete({ _id: transactionId, owner: userId });

    if (!transaction) {
      res.status(404).send({ error: 'Transação não encontrada.' });
      return;
    }

    res.send(transaction);
  } catch (error) {
    console.error('Erro ao apagar transação:', error);
    res.status(500).send(error);
  }
};