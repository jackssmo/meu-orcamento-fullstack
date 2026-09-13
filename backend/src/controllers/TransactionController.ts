import { Response } from 'express';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { TransactionService } from '../services/TransactionService';
import { AuthRequest } from '../middleware/auth.middleware';

const transactionRepository = new TransactionRepository();
const transactionService = new TransactionService(transactionRepository);

export class TransactionController {
    async create(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Usuário não autenticado.' });
            }
            const transaction = await transactionService.createTransaction(userId, req.body);
            return res.status(201).json(transaction);
        }
        catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    async list(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Usuário não autenticado.' });
            }
            const transactions = await transactionService.getTransactionsByUserId(userId);
            return res.status(200).json(transactions);
        }
        catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    async update(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id;
            const id = req.params.id;

            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado.' });
            }

            if (typeof id !== 'string' || !/^\d+$/.test(id)) {
                return res.status(400).json({ error: 'ID de transação inválido.' });
            }

            const transactionId = Number(id);

            if (transactionId <= 0) {
                return res.status(400).json({ error: 'ID de transação inválido.' });
            }

            const updatedTransaction = await transactionService.updateTransaction(
                transactionId,
                userId,
                req.body
            );

            return res.status(200).json(updatedTransaction);

        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async delete(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id;
            const id = req.params.id;

            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado.' });
            }

            if (typeof id !== 'string' || !/^\d+$/.test(id)) {
                return res.status(400).json({ error: 'ID de transação inválido.' });
            }

            const transactionId = Number(id);

            if (transactionId <= 0) {
                return res.status(400).json({ error: 'ID de transação inválido.' });
            }

            await transactionService.deleteTransaction(transactionId, userId);

            return res.status(200).json({ message: 'Transação excluída com sucesso!' });

        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async getSummary(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado.' });
            }

            const summary = await transactionService.getTransactionSummary(userId);

            return res.status(200).json(summary);

        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}