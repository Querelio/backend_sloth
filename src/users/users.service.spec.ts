import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const user = {
    id: 7,
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    roleId: 1,
    role: { id: 1, name: 'Intervenant' },
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns the current user profile', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(service.findOne(7, 7)).resolves.toEqual(user);
  });

  it('returns 404 when fetching another user', async () => {
    await expect(service.findOne(30, 42)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
