import bcrypt from 'bcryptjs';
import { IUserRepository } from '../repositories/IUserRepository';
import { User } from '../models/User';

export class UserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async registerUser(name: string, email: string, password_plain: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!name || name.trim().length < 2) throw new Error('O nome deve ter pelo menos 2 caracteres.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) throw new Error('Informe um e-mail válido.');
    if (password_plain.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');
    
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new Error('Este e-mail já está em uso'); 
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password_plain, salt);

    const newUser: User = {
      name: name.trim(),
      email: normalizedEmail,
      password_hash
    };

    return await this.userRepository.save(newUser);
  }

  async authenticate(email: string, password_plain: string): Promise<User> {
    
    const user = await this.userRepository.findByEmail(email.trim().toLowerCase());
    if (!user) {
      throw new Error('E-mail ou senha incorretos');
    }

    const isPasswordValid = await bcrypt.compare(password_plain, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('E-mail ou senha incorretos');
    }

    return user;
  }

  async updateProfile(
    id: number,
    name: string,
    email: string,
    currentPassword: string,
    newPassword?: string,
  ): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('Usuário não encontrado.');
    if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      throw new Error('A senha atual está incorreta.');
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedName.length < 2) throw new Error('O nome deve ter pelo menos 2 caracteres.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) throw new Error('Informe um e-mail válido.');

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser && existingUser.id !== id) throw new Error('Este e-mail já está em uso');

    let passwordHash = user.password_hash;
    if (newPassword !== undefined && newPassword.length > 0) {
      if (newPassword.length < 6) throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await this.userRepository.update(id, {
      name: normalizedName,
      email: normalizedEmail,
      password_hash: passwordHash,
    });

    return { ...user, name: normalizedName, email: normalizedEmail, password_hash: passwordHash };
  }
}