import { Transaction } from '../models/Transaction';
import { TransactionRepository } from '../repositories/TransactionRepository';

export class TransactionService {
    constructor(private transactionRepository: TransactionRepository) { }

    async createTransaction(userId: number, data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> {
        const { description, amount, type, category, date, is_fixed, installments } = data;

        if (!description || description.trim().length < 2) {
            throw new Error("A descrição da transação deve ter pelo menos 2 caracteres.");
        };

        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
            throw new Error("O valor da transação deve ser maior que zero.");
        }

        if (type !== 'income' && type !== 'expense') {
            throw new Error("O tipo da transação deve ser 'receita' ou 'despesa'.");
        }

        if (!category || category.trim() === '') {
            throw new Error("A categoria da transação é obrigatória.");
        }

        if (!date) {
            throw new Error("A data da transação é obrigatória.");
        }

       const numInstallments = installments && installments > 0 ? installments : 1;
        const isFixed = is_fixed || false;

        if (type === 'expense' && numInstallments > 1) {
            const installmentAmount = amount / numInstallments;
            let firstTransaction: Transaction | null = null;

            for (let i = 0; i < numInstallments; i++) {
                const transactionDate = new Date(date);
                transactionDate.setMonth(transactionDate.getMonth() + i);

                const newTransaction = {
                    user_id: userId,
                    description: `${description} (${i + 1}/${numInstallments})`,
                    amount: installmentAmount,
                    type,
                    category,
                    date: transactionDate,
                    is_fixed: false,
                    installments: numInstallments
                };
                const created = await this.transactionRepository.create(newTransaction);
                if (i === 0) firstTransaction = created;
            }
            return firstTransaction!; 
        }

        if (type === 'income' && isFixed) {
            const monthsToProject = 12; 
            let firstTransaction: Transaction | null = null;

            for (let i = 0; i < monthsToProject; i++) {
                const transactionDate = new Date(date);
                transactionDate.setMonth(transactionDate.getMonth() + i);

                const newTransaction = {
                    user_id: userId,
                    description,
                    amount,
                    type,
                    category,
                    date: transactionDate,
                    is_fixed: true,
                    installments: 1
                };
                const created = await this.transactionRepository.create(newTransaction);
                if (i === 0) firstTransaction = created;
            }
            return firstTransaction!;
        }

        const newTransaction: Transaction = {
            user_id: userId,
            description,
            amount,
            type,
            category,
            date,
            is_fixed: isFixed,
            installments: numInstallments
        };

        return await this.transactionRepository.create(newTransaction);
    }

    async updateTransaction(
        id: number,
        userId: number,
        data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>
    ): Promise<Transaction> {

        const existingTransaction = await this.transactionRepository.findById(id);

        if (!existingTransaction) {
            throw new Error('Transação não encontrada.');
        }

        if (existingTransaction.user_id !== userId) {
            throw new Error('Acesso negado. Você não tem permissão para alterar esta transação.');
        }

        if (!data.description || data.description.trim().length < 2) {
            throw new Error('A descrição deve ter pelo menos 2 caracteres.');
        }
        if (
    typeof data.amount !== 'number' ||
    !Number.isFinite(data.amount) ||
    data.amount <= 0
) {
            throw new Error('O valor da transação deve ser maior que zero.');
        }

        if (data.type !== 'income' && data.type !== 'expense') {
    throw new Error("O tipo da transação deve ser 'income' ou 'expense'.");
}

if (!data.category || data.category.trim() === '') {
    throw new Error('A categoria da transação é obrigatória.');
}

if (!data.date) {
    throw new Error('A data da transação é obrigatória.');
}

        const updatedTransaction: Transaction = {
            id,
            user_id: userId,
            ...data
        };

        await this.transactionRepository.update(id, updatedTransaction);

        return updatedTransaction;
    }

    async deleteTransaction(id: number, userId: number): Promise<void> {
        const existingTransaction = await this.transactionRepository.findById(id);

        if (!existingTransaction) {
            throw new Error('Transação não encontrada.');
        }

        if (existingTransaction.user_id !== userId) {
            throw new Error('Acesso negado. Você não tem permissão para excluir esta transação.');
        }

        await this.transactionRepository.delete(id);
    }
    async getTransactionSummary(userId: number) {
    return await this.transactionRepository.getSummary(userId);
  }

    async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
        return await this.transactionRepository.findByUserId(userId);
    }
}