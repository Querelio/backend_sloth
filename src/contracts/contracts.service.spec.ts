import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ContractsService } from './contracts.service';

describe('ContractsService', () => {
  let service: ContractsService;
  let prisma: {
    contract: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    institution: { findUnique: jest.Mock };
    pricingMode: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      contract: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      institution: { findUnique: jest.fn().mockResolvedValue({ id: 1 }) },
      pricingMode: { findUnique: jest.fn().mockResolvedValue({ id: 1 }) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('normalizes date-only strings when creating a contract', async () => {
    const createdContract = {
      id: 1,
      startDate: new Date('2026-09-01T00:00:00.000Z'),
      endDate: new Date('2027-06-30T00:00:00.000Z'),
    };
    prisma.contract.create.mockResolvedValue({ id: createdContract.id });

    await expect(
      service.create(
        {
          institutionId: 1,
          pricingModeId: 1,
          contractNumber: 'CTR-2026-001',
          startDate: '2026-09-01',
          endDate: '2027-06-30',
          hourlyVolumePlanned: 120.5,
          unitPrice: 45,
        },
        7,
      ),
    ).resolves.toEqual({ id: createdContract.id });

    expect(prisma.contract.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        teacherId: 7,
        startDate: new Date('2026-09-01T00:00:00.000Z'),
        endDate: new Date('2027-06-30T00:00:00.000Z'),
      }),
      select: { id: true },
    });
  });

  it('normalizes date-only strings when updating a contract', async () => {
    prisma.contract.findFirst.mockResolvedValue({
      id: 1,
      teacherId: 7,
      startDate: new Date('2026-09-01T00:00:00.000Z'),
      endDate: new Date('2027-06-30T00:00:00.000Z'),
    });
    const updatedContract = {
      id: 1,
      startDate: new Date('2026-09-01T00:00:00.000Z'),
      endDate: new Date('2027-06-30T00:00:00.000Z'),
    };
    prisma.contract.update.mockResolvedValue(updatedContract);

    await expect(
      service.update(
        1,
        {
          startDate: '2026-09-01',
          endDate: '2027-06-30',
        },
        7,
      ),
    ).resolves.toEqual({
      ...updatedContract,
      startDate: '2026-09-01',
      endDate: '2027-06-30',
    });

    expect(prisma.contract.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        startDate: new Date('2026-09-01T00:00:00.000Z'),
        endDate: new Date('2027-06-30T00:00:00.000Z'),
      }),
    });
  });

  it('formats date-only fields when listing own contracts', async () => {
    const contracts = [
      {
        id: 1,
        startDate: new Date('2026-09-01T00:00:00.000Z'),
        endDate: new Date('2027-06-30T00:00:00.000Z'),
      },
    ];
    prisma.contract.findMany.mockResolvedValue(contracts);

    await expect(service.findAll(7)).resolves.toEqual([
      {
        ...contracts[0],
        startDate: '2026-09-01',
        endDate: '2027-06-30',
      },
    ]);
    expect(prisma.contract.findMany).toHaveBeenCalledWith({
      where: { teacherId: 7 },
      include: expect.any(Object),
    });
  });

  it('returns 404 when fetching another user contract', async () => {
    prisma.contract.findFirst.mockResolvedValue(null);

    await expect(service.findOne(1, 42)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.contract.findFirst).toHaveBeenCalledWith({
      where: { id: 1, teacherId: 42 },
      include: expect.any(Object),
    });
  });
});
