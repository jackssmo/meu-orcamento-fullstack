import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

connectDB();

app.use('/', authRoutes);
app.use('/', transactionRoutes);

app.get('/api/status', (req, res) => {
  res.json({ message: 'API a funcionar em TypeScript e muito mais segura!' });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});