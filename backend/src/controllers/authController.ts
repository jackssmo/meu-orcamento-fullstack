import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { UserService } from '../services/UserService';
import jwt from 'jsonwebtoken';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export class AuthController {
  
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
      }

      const user = await userService.registerUser(email, password);

      const { password_hash, ...userWithoutPassword } = user;

      return res.status(201).json(userWithoutPassword);
      
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
      }

      const user = await userService.authenticate(email, password);
      const { password_hash, ...userWithoutPassword } = user;

      const payload = { id: user.id, email: user.email };
      const secret = process.env.JWT_SECRET as string;
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      
      return res.status(200).json({ 
        message: 'Login bem-sucedido!', 
        user: userWithoutPassword,
        token 
      });

    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }
}