// server.js

const express = require('express');
const cors = require('cors'); // <-- Adicione este import
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const auth = require('./middleware/auth');
const Transaction = require('./models/Transaction'); // <-- Adicione este import no topo

const app = express();
const port = 3000;
app.use(express.static('public'));
app.use(cors());

app.use(express.json());

// Cole a sua Connection String aqui
// IMPORTANTE: Substitua <password> pela senha que você anotou!
const connectionString = "mongodb+srv://user_orcamento:jack_user23@cluster0.kik6xaa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; 

mongoose.connect(connectionString)
  .then(() => console.log('Conectado ao MongoDB Atlas com sucesso!'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// --- ROTA DE CADASTRO DE USUÁRIO ---
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).send('Usuário criado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).send('Erro ao criar usuário.');
  }
});

// --- ROTA DE LOGIN ---
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('Usuário não encontrado.');
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).send('Senha incorreta.');
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      'SEU_SEGREDO_SUPER_SECRETO',
      { expiresIn: '1h' }
    );
    res.status(200).json({ token: token });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).send('Erro ao fazer login.');
  }
});

// --- ROTA PROTEGIDA DE PERFIL ---
app.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.send(user);
  } catch (error) {
    res.status(500).send('Erro ao buscar perfil.');
  }
});

app.post('/transactions', auth, async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body, // Pega todos os dados enviados (description, amount, type, etc.)
      owner: req.user.userId // Adiciona o ID do usuário logado (vem do middleware 'auth')
    });
    await transaction.save();
    res.status(201).send(transaction);
  } catch (error) {
    res.status(400).send(error);
  }
});

// ROTA PARA LISTAR TODAS AS TRANSAÇÕES DO USUÁRIO LOGADO
app.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ owner: req.user.userId });
    res.send(transactions);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete('/transactions/:id', auth, async (req, res) => {
  try {
    const transactionId = req.params.id; // Pega o ID da URL
    const userId = req.user.userId;     // Pega o ID do usuário logado (do token)

    // Encontra e deleta a transação que tenha o ID correto E pertença ao usuário logado
    const transaction = await Transaction.findOneAndDelete({ _id: transactionId, owner: userId });

    if (!transaction) {
      // Se não encontrar a transação (ou ela não pertencer ao usuário), retorna um erro
      return res.status(404).send({ error: 'Transação não encontrada.' });
    }

    res.send(transaction); // Retorna a transação que foi deletada
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/transactions/:id', auth, async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.user.userId;
    const updates = req.body; // Dados a serem atualizados (ex: { description: 'Novo nome' })

    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, owner: userId }, // Condições: encontrar pelo ID E pelo dono
      updates, // Os novos dados a serem aplicados
      { new: true, runValidators: true } // Opções: retornar o documento novo e rodar validações
    );

    if (!transaction) {
      return res.status(404).send({ error: 'Transação não encontrada.' });
    }

    res.send(transaction); // Retorna a transação atualizada
  } catch (error) {
    res.status(400).send(error); // Erro de validação ou outro
  }
});


// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});