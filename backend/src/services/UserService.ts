import bcrypt from 'bcryptjs';
import { IUserRepository } from '../repositories/IUserRepository';
import { User } from '../models/User';

export class UserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async registerUser(email: string, password_plain: string): Promise<User> {
    
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Este e-mail já está em uso'); 
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password_plain, salt);

    const newUser: User = {
      email,
      password_hash
    };

    return await this.userRepository.save(newUser);
  }

  async authenticate(email: string, password_plain: string): Promise<User> {
    
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('E-mail ou senha incorretos');
    }

    const isPasswordValid = await bcrypt.compare(password_plain, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('E-mail ou senha incorretos');
    }

    return user;
  }
}