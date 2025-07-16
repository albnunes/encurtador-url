import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: Partial<User>): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  findWithUrls(id: string): Promise<User | null>;
  count(): Promise<number>;
  exists(email: string): Promise<boolean>;
}
