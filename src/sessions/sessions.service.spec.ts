import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SessionsService } from './sessions.service';

describe('SessionsService', () => {
  let service: SessionsService;
  let prisma: {
    session: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    contract: { findUnique: jest.Mock };
    class: { findUnique: jest.Mock };
    status: { findUnique: jest.Mock };
  };

  const session = {
    id: 1,
    title: 'Math lesson',
    date: new Date('2026-07-01T00:00:00.000Z'),
    start: new Date('1970-01-01T09:00:00.000Z'),
    end: new Date('1970-01-01T10:00:00.000Z'),
    declarationDate: new Date('2026-07-08T00:00:00.000Z'),
  };

  const todayDeclarationDate = new Date(
    `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`,
  );

  beforeEach(async () => {
    prisma = {
      session: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      contract: { findUnique: jest.fn() },
      class: { findUnique: jest.fn() },
      status: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('assigns teacherId and normalizes date and time when creating a session', async () => {
    prisma.session.create.mockResolvedValue({ id: session.id });

    await expect(
      service.create(
        {
          title: 'Math lesson',
          date: '2026-07-01',
          start: '09:00',
          end: '10:00',
        },
        7,
      ),
    ).resolves.toEqual({ id: session.id });

    expect(prisma.session.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        teacherId: 7,
        date: new Date('2026-07-01T00:00:00.000Z'),
        start: new Date('1970-01-01T09:00:00.000Z'),
        end: new Date('1970-01-01T10:00:00.000Z'),
      }),
      select: { id: true },
    });

    const createData = prisma.session.create.mock.calls[0][0].data;
    expect(createData).not.toHaveProperty('declarationDate');
  });

  it('sets declarationDate when creating a session with a declaration reference', async () => {
    prisma.session.create.mockResolvedValue({ id: session.id });

    await service.create(
      {
        title: 'Math lesson',
        date: '2026-07-01',
        start: '09:00',
        end: '10:00',
        declarationReference: 'REF-123',
      },
      7,
    );

    expect(prisma.session.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        teacherId: 7,
        declarationReference: 'REF-123',
        declarationDate: todayDeclarationDate,
      }),
      select: { id: true },
    });
  });

  it('forbids creating a session on another user contract', async () => {
    prisma.contract.findUnique.mockResolvedValue({ teacherId: 30 });

    await expect(
      service.create(
        {
          title: 'Math lesson',
          date: '2026-07-01',
          start: '09:00',
          end: '10:00',
          contractId: 9,
        },
        42,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.session.create).not.toHaveBeenCalled();
  });

  it('sets declarationDate when updating a session with a declaration reference', async () => {
    prisma.session.findFirst.mockResolvedValue(session);
    prisma.session.update.mockResolvedValue(session);

    await expect(
      service.update(
        1,
        {
          declarationReference: 'REF-456',
        },
        7,
      ),
    ).resolves.toEqual({
      ...session,
      date: '2026-07-01',
      start: '09:00',
      end: '10:00',
      declarationDate: '2026-07-08',
    });

    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        declarationReference: 'REF-456',
        declarationDate: todayDeclarationDate,
      }),
    });
  });

  it('clears declarationDate when updating a session with an empty declaration reference', async () => {
    prisma.session.findFirst.mockResolvedValue(session);
    prisma.session.update.mockResolvedValue({
      ...session,
      declarationReference: null,
      declarationDate: null,
    });

    await service.update(
      1,
      {
        declarationReference: '',
      },
      7,
    );

    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        declarationReference: '',
        declarationDate: null,
      }),
    });
  });

  it('normalizes date and time strings when updating a session', async () => {
    prisma.session.findFirst.mockResolvedValue(session);
    prisma.session.update.mockResolvedValue(session);

    await expect(
      service.update(
        1,
        {
          date: '2026-07-01',
          start: '09:00',
          end: '10:00',
        },
        7,
      ),
    ).resolves.toEqual({
      ...session,
      date: '2026-07-01',
      start: '09:00',
      end: '10:00',
      declarationDate: '2026-07-08',
    });

    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        date: new Date('2026-07-01T00:00:00.000Z'),
        start: new Date('1970-01-01T09:00:00.000Z'),
        end: new Date('1970-01-01T10:00:00.000Z'),
      }),
    });

    const updateData = prisma.session.update.mock.calls[0][0].data;
    expect(updateData).not.toHaveProperty('declarationDate');
  });

  it('formats date and time fields when listing own sessions', async () => {
    prisma.session.findMany.mockResolvedValue([session]);

    await expect(service.findAll(7)).resolves.toEqual([
      {
        ...session,
        date: '2026-07-01',
        start: '09:00',
        end: '10:00',
        declarationDate: '2026-07-08',
      },
    ]);
    expect(prisma.session.findMany).toHaveBeenCalledWith({
      where: { teacherId: 7 },
      include: expect.any(Object),
    });
  });

  it('returns 404 when fetching another user session', async () => {
    prisma.session.findFirst.mockResolvedValue(null);

    await expect(service.findOne(1, 42)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
