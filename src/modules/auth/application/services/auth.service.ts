import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from '../dtos/auth.dto';
import { AppLoggerService } from '../../../../shared/infrastructure/logging';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) { }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log('User registration attempt', {
      email: registerDto.email,
      name: registerDto.name,
    });

    const existingUser = await this.userRepository.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      this.logger.warn('Registration failed: email already exists', {
        email: registerDto.email,
      });
      throw new ConflictException('Email already exists');
    }

    const user = await this.userRepository.create({
      email: registerDto.email,
      password: registerDto.password,
      name: registerDto.name,
    });

    const accessToken = this.generateToken(user);

    this.logger.logAuthentication(user.id, 'register', true);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log('User login attempt', {
      email: loginDto.email,
    });

    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      this.logger.warn('Login failed: user not found', {
        email: loginDto.email,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(loginDto.password);
    if (!isPasswordValid) {
      this.logger.warn('Login failed: invalid password', {
        email: loginDto.email,
        userId: user.id,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateToken(user);

    this.logger.logAuthentication(user.id, 'login', true);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async validateUser(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserWithUrls(id: string): Promise<User | null> {
    return this.userRepository.findWithUrls(id);
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
    });
  }
}
