import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); 

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`Conectado ao MongoDB Atlas com sucesso!`);
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};