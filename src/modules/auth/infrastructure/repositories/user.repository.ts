import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) { }

  async create(user: Partial<User>): Promise<User> {
    try {
      const existingUser = await this.findByEmail(user.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
      const newUser = this.repository.create(user);
      return await this.repository.save(newUser);
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.repository.findOne({
        where: { email },
      });
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.repository.findOne({
        where: { id },
        relations: ['urls'],
      });
    } catch (error) {
      throw new Error(`Failed to find user by id: ${error.message}`);
    }
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    try {
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      if (data.email && data.email !== existingUser.email) {
        const userWithEmail = await this.findByEmail(data.email);
        if (userWithEmail) {
          throw new ConflictException('Email already exists');
        }
      }

      await this.repository.update(id, data);

      const updatedUser = await this.findById(id);
      if (!updatedUser) {
        throw new Error('Failed to retrieve updated user');
      }

      return updatedUser;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.repository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async findWithUrls(id: string): Promise<User | null> {
    try {
      return await this.repository.findOne({
        where: { id },
        relations: ['urls'],
        order: { urls: { createdAt: 'DESC' } },
      });
    } catch (error) {
      throw new Error(`Failed to find user with urls: ${error.message}`);
    }
  }

  async count(): Promise<number> {
    try {
      return await this.repository.count();
    } catch (error) {
      throw new Error(`Failed to count users: ${error.message}`);
    }
  }

  async exists(email: string): Promise<boolean> {
    try {
      const count = await this.repository.count({
        where: { email },
      });
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check if user exists: ${error.message}`);
    }
  }
}
