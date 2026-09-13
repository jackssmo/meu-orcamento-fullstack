import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/db';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API do Meu Orcamento funcionando!' });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});