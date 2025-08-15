// models/Transaction.js

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true // Remove espaços em branco do início e fim
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense'] // Só pode ser 'income' (receita) ou 'expense' (despesa)
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  // A parte mais importante: a referência ao usuário dono da transação
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Faz referência ao nosso modelo 'User'
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;