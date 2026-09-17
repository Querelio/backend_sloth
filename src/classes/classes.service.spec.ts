import { Test, TestingModule } from '@nestjs/testing';
import { ClassesService } from './classes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ClassesService', () => {
  let service: ClassesService;
  let prisma: {
    class: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    institution: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      class: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      institution: { findUnique: jest.fn().mockResolvedValue({ id: 1 }) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a class with the provided dto', async () => {
    prisma.class.create.mockResolvedValue({ id: 42 });

    const createClassDto = {
      institutionId: 1,
      classLevel: '6eme',
      studentCount: 25,
      name: 'Test Class',
    };

    await service.create(createClassDto);

    expect(prisma.class.create).toHaveBeenCalledWith({
      data: createClassDto,
      select: { id: true },
    });
  });
});
