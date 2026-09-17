import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PricingModeService } from './pricing-mode.service';

describe('PricingModeService', () => {
  let service: PricingModeService;
  let prisma: {
    pricingMode: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  const pricingMode = { id: 1, name: 'Hourly' };

  beforeEach(async () => {
    prisma = {
      pricingMode: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingModeService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<PricingModeService>(PricingModeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list pricing modes', async () => {
    prisma.pricingMode.findMany.mockResolvedValue([pricingMode]);

    await expect(service.findAll()).resolves.toEqual([pricingMode]);
    expect(prisma.pricingMode.findMany).toHaveBeenCalledTimes(1);
  });

  it('should get a pricing mode by ID', async () => {
    prisma.pricingMode.findUnique.mockResolvedValue(pricingMode);

    await expect(service.findOne(1)).resolves.toEqual(pricingMode);
    expect(prisma.pricingMode.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should throw NotFoundException when pricing mode does not exist', async () => {
    prisma.pricingMode.findUnique.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should wrap Prisma list errors', async () => {
    prisma.pricingMode.findMany.mockRejectedValue(new Error('Database error'));

    await expect(service.findAll()).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
