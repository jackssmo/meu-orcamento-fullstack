import { Transaction } from '../models/Transaction';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { transactionSchema } from '../validators/transaction.schema';
import { getMonthlyOccurrenceDate } from '../utils/recurrenceDate';

export class TransactionService {
    constructor(private transactionRepository: TransactionRepository) { }

    async createTransaction(userId: number, data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> {
        const parsed = transactionSchema.safeParse(data);
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Dados da transação inválidos.');
        const { description, amount, type, category, date, installments, is_fixed, account_id } = parsed.data;
        if (is_fixed && type !== 'income') {
            throw new Error("A recorrência fixa está disponível apenas para receitas.");
        }

        const occurrenceCount = is_fixed ? 12 : (installments ?? 1);
        const installmentAmount = Math.round(amount * 100) / 100;
        const firstDate = new Date(date);
        firstDate.setUTCHours(0, 0, 0, 0);
        if (Number.isNaN(firstDate.getTime())) {
            throw new Error("A data da transação é inválida.");
        }
        const newTransactions: Transaction[] = [];

        for (let occurrence = 0; occurrence < occurrenceCount; occurrence += 1) {
            const transactionDate = getMonthlyOccurrenceDate(firstDate, occurrence);
            newTransactions.push({
                user_id: userId,
                description: is_fixed ? `${description} (${occurrence + 1}/12)` : `${description} (${occurrence + 1}/${occurrenceCount})`,
                amount: installmentAmount,
                type,
                category,
                date: transactionDate.toISOString().substring(0, 10),
                is_fixed: Boolean(is_fixed),
                installments: occurrenceCount,
                installment_number: occurrence + 1,
                account_id,
            });
        }
        const created = await this.transactionRepository.createMany(newTransactions);
        return created[0] as Transaction;
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

        const parsed = transactionSchema.safeParse(data);
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Dados da transação inválidos.');

        const updatedTransaction: Transaction = {
            id,
            user_id: userId,
            ...parsed.data,
            date: parsed.data.date.toISOString().substring(0, 10),
        };

        const isInstallmentExpense =
            existingTransaction.type === 'expense' &&
            !existingTransaction.is_fixed &&
            (existingTransaction.installments ?? 1) > 1;

        if (isInstallmentExpense) {
            await this.transactionRepository.updateInstallmentSeries(
                existingTransaction,
                updatedTransaction,
            );
        } else {
            await this.transactionRepository.update(id, updatedTransaction);
        }

        return updatedTransaction;
    }

    async deleteTransaction(
        id: number,
        userId: number,
        deleteSeries = false,
    ): Promise<{ deletedFutureIncome: boolean; deletedSeries: boolean }> {
        const existingTransaction = await this.transactionRepository.findById(id);

        if (!existingTransaction) {
            throw new Error('Transação não encontrada.');
        }

        if (existingTransaction.user_id !== userId) {
            throw new Error('Acesso negado. Você não tem permissão para excluir esta transação.');
        }

        const isFixedIncome = existingTransaction.type === 'income' && Boolean(existingTransaction.is_fixed);
        if (isFixedIncome) {
            await this.transactionRepository.deleteFixedIncomeFromDate(userId, existingTransaction);
        } else if (
            deleteSeries &&
            existingTransaction.type === 'expense' &&
            !existingTransaction.is_fixed &&
            (existingTransaction.installments ?? 1) > 1
        ) {
            await this.transactionRepository.deleteInstallmentSeries(userId, existingTransaction);
        } else {
            await this.transactionRepository.delete(id, userId);
        }

        return {
            deletedFutureIncome: isFixedIncome,
            deletedSeries:
                deleteSeries &&
                existingTransaction.type === 'expense' &&
                !existingTransaction.is_fixed &&
                (existingTransaction.installments ?? 1) > 1,
        };
    }
    async getTransactionSummary(userId: number, month?: number, year?: number) {
    return await this.transactionRepository.getSummary(userId, month, year);
  }

    async getTransactionsByUserId(userId: number, options: Parameters<TransactionRepository['findByUserId']>[1]) {
        return await this.transactionRepository.findByUserId(userId, options);
    }
}