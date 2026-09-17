import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AgendaService } from './agenda.service';

describe('AgendaService', () => {
  let service: AgendaService;
  let prisma: {
    session: {
      findMany: jest.Mock;
    };
  };

  const sessionWithClass = {
    id: 1,
    title: 'Math lesson',
    date: new Date('2026-07-01T00:00:00.000Z'),
    start: new Date('1970-01-01T09:00:00.000Z'),
    end: new Date('1970-01-01T10:00:00.000Z'),
    declarationDate: null,
    class: {
      id: 1,
      name: 'SIO',
      classLevel: 'BTS',
      institution: { id: 1, color: '#117964' },
    },
  };

  const sessionWithoutClass = {
    id: 2,
    title: 'Open session',
    date: new Date('2026-07-01T00:00:00.000Z'),
    start: new Date('1970-01-01T11:00:00.000Z'),
    end: new Date('1970-01-01T12:00:00.000Z'),
    declarationDate: null,
    class: null,
  };

  beforeEach(async () => {
    prisma = {
      session: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<AgendaService>(AgendaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list agenda sessions with institution color from class', async () => {
    prisma.session.findMany.mockResolvedValue([sessionWithClass]);

    await expect(service.findSessions(7)).resolves.toEqual([
      {
        ...sessionWithClass,
        date: '2026-07-01',
        start: '09:00',
        end: '10:00',
        declarationDate: null,
        color: '#117964',
      },
    ]);
    expect(prisma.session.findMany).toHaveBeenCalledWith({
      where: { teacherId: 7 },
      include: expect.any(Object),
    });
  });

  it('should use default color when session has no class', async () => {
    prisma.session.findMany.mockResolvedValue([sessionWithoutClass]);

    await expect(service.findSessions(7)).resolves.toEqual([
      {
        ...sessionWithoutClass,
        date: '2026-07-01',
        start: '11:00',
        end: '12:00',
        declarationDate: null,
        color: '#3B82F6',
      },
    ]);
  });

  it('should list agenda sessions by date', async () => {
    prisma.session.findMany.mockResolvedValue([sessionWithClass]);

    await expect(service.findSessionsByDate('2026-07-01', 7)).resolves.toEqual([
      {
        ...sessionWithClass,
        date: '2026-07-01',
        start: '09:00',
        end: '10:00',
        declarationDate: null,
        color: '#117964',
      },
    ]);
    expect(prisma.session.findMany).toHaveBeenCalledWith({
      where: {
        teacherId: 7,
        date: {
          gte: new Date('2026-07-01T00:00:00.000Z'),
          lt: new Date('2026-07-02T00:00:00.000Z'),
        },
      },
      include: expect.any(Object),
    });
  });

  it('should reject dates outside YYYY-MM-DD format', async () => {
    await expect(
      service.findSessionsByDate('01-07-2026', 7),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.session.findMany).not.toHaveBeenCalled();
  });

  it('should reject invalid calendar dates', async () => {
    await expect(
      service.findSessionsByDate('2026-02-31', 7),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.session.findMany).not.toHaveBeenCalled();
  });

  it('should wrap Prisma list errors', async () => {
    prisma.session.findMany.mockRejectedValue(new Error('Database error'));

    await expect(service.findSessions(7)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
