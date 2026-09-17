import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Class, Prisma } from '../generated/prisma/client';
import { CreatedResourceDto } from '../common/dto/created-resource.dto';
import { assertRecordExists } from '../common/ownership';
import {
  isForeignKeyConstraintError,
  isPrismaNotFoundError,
} from '../common/prisma-errors';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

const classInclude = {
  institution: {
    select: { id: true, name: true },
  },
} satisfies Prisma.ClassInclude;

type ClassWithRelations = Prisma.ClassGetPayload<{
  include: typeof classInclude;
}>;

export type { ClassWithRelations };

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto): Promise<CreatedResourceDto> {
    await this.assertInstitutionExists(createClassDto.institutionId);

    try {
      return await this.prisma.class.create({
        data: createClassDto,
        select: { id: true },
      });
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        throw new BadRequestException('Invalid institutionId');
      }
      throw new InternalServerErrorException('Failed to create class', {
        cause: error,
      });
    }
  }

  async findAll(): Promise<ClassWithRelations[]> {
    try {
      return await this.prisma.class.findMany({ include: classInclude });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch classes', {
        cause: error,
      });
    }
  }

  async findOne(id: number): Promise<ClassWithRelations> {
    try {
      const classEntity = await this.prisma.class.findUnique({
        where: { id },
        include: classInclude,
      });

      if (!classEntity) {
        throw new NotFoundException(`Class #${id} not found`);
      }

      return classEntity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch class', {
        cause: error,
      });
    }
  }

  async update(id: number, updateClassDto: UpdateClassDto): Promise<Class> {
    await this.findOne(id);

    if (updateClassDto.institutionId !== undefined) {
      await this.assertInstitutionExists(updateClassDto.institutionId);
    }

    try {
      return await this.prisma.class.update({
        where: { id },
        data: updateClassDto,
      });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`Class #${id} not found`);
      }
      if (isForeignKeyConstraintError(error)) {
        throw new BadRequestException('Invalid institutionId');
      }
      throw new InternalServerErrorException('Failed to update class', {
        cause: error,
      });
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    try {
      await this.prisma.class.delete({ where: { id } });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`Class #${id} not found`);
      }
      if (isForeignKeyConstraintError(error)) {
        throw new ConflictException(
          'Cannot delete class with related sessions',
        );
      }
      throw new InternalServerErrorException('Failed to delete class', {
        cause: error,
      });
    }
  }

  private async assertInstitutionExists(institutionId: number): Promise<void> {
    await assertRecordExists(
      () =>
        this.prisma.institution.findUnique({
          where: { id: institutionId },
          select: { id: true },
        }),
      'institutionId',
    );
  }
}
