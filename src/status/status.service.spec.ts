import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StatusService } from './status.service';

describe('StatusService', () => {
  let service: StatusService;
  let prisma: {
    status: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  const status = { id: 1, name: 'Planifiée' };

  beforeEach(async () => {
    prisma = {
      status: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<StatusService>(StatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list statuses', async () => {
    prisma.status.findMany.mockResolvedValue([status]);

    await expect(service.findAll()).resolves.toEqual([status]);
    expect(prisma.status.findMany).toHaveBeenCalledTimes(1);
  });

  it('should get a status by ID', async () => {
    prisma.status.findUnique.mockResolvedValue(status);

    await expect(service.findOne(1)).resolves.toEqual(status);
    expect(prisma.status.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should throw NotFoundException when status does not exist', async () => {
    prisma.status.findUnique.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should wrap Prisma list errors', async () => {
    prisma.status.findMany.mockRejectedValue(new Error('Database error'));

    await expect(service.findAll()).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
