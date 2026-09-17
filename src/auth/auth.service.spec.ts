import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { create: jest.Mock; findUnique: jest.Mock };
    role: { findFirst: jest.Mock };
  };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      role: {
        findFirst: jest.fn().mockResolvedValue({ id: 4, name: 'Intervenant' }),
      },
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'john@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('returns status created and hashes password with Intervenant role', async () => {
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.user.create.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result).toEqual({ status: 'created' });
      expect(argon2.hash).toHaveBeenCalledWith('password123');
      expect(prisma.role.findFirst).toHaveBeenCalledWith({
        where: { name: 'Intervenant' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'john@example.com',
          password: 'hashed-password',
          firstName: 'John',
          lastName: 'Doe',
          roleId: 4,
        },
      });
    });

    it('throws ConflictException on duplicate email', async () => {
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws InternalServerErrorException on prisma failure', async () => {
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.user.create.mockRejectedValue(new Error('db error'));

      await expect(service.register(registerDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    const user = {
      id: 1,
      email: 'john@example.com',
      password: 'hashed-password',
      firstName: 'John',
      lastName: 'Doe',
      roleId: 1,
    };

    it('returns userId, fullName and token on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        userId: 1,
        fullName: 'John Doe',
        token: 'jwt-token',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1 });
    });

    it('throws UnauthorizedException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException on wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws InternalServerErrorException on prisma failure', async () => {
      prisma.user.findUnique.mockRejectedValue(new Error('db error'));

      await expect(service.login(loginDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
