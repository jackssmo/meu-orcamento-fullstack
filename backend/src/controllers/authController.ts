import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // CORREÇÃO: Validação antecipada - Verifica se o e-mail já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).send('Usuário não encontrado.');
      return;
    }
    
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(400).send('Senha incorreta.');
      return;
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
    
    res.status(200).json({ token });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).send('Erro ao fazer login.');
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    
    if (!user) {
      res.status(404).send('Usuário não encontrado.');
      return;
    }
    
    res.send(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).send('Erro ao buscar perfil.');
  }
};