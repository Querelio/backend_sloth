import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Institution } from '../generated/prisma/client';
import { CreatedResourceDto } from '../common/dto/created-resource.dto';
import {
  isForeignKeyConstraintError,
  isPrismaNotFoundError,
} from '../common/prisma-errors';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createInstitutionDto: CreateInstitutionDto,
  ): Promise<CreatedResourceDto> {
    try {
      return await this.prisma.institution.create({
        data: createInstitutionDto,
        select: { id: true },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create institution', {
        cause: error,
      });
    }
  }

  async findAll(): Promise<Institution[]> {
    try {
      return await this.prisma.institution.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch institutions', {
        cause: error,
      });
    }
  }

  async findOne(id: number): Promise<Institution> {
    try {
      const institution = await this.prisma.institution.findUnique({
        where: { id },
      });

      if (!institution) {
        throw new NotFoundException(`Institution #${id} not found`);
      }

      return institution;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch institution', {
        cause: error,
      });
    }
  }

  async update(
    id: number,
    updateInstitutionDto: UpdateInstitutionDto,
  ): Promise<Institution> {
    await this.findOne(id);

    try {
      return await this.prisma.institution.update({
        where: { id },
        data: updateInstitutionDto,
      });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`Institution #${id} not found`);
      }
      throw new InternalServerErrorException('Failed to update institution', {
        cause: error,
      });
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    try {
      await this.prisma.institution.delete({ where: { id } });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`Institution #${id} not found`);
      }
      if (isForeignKeyConstraintError(error)) {
        throw new ConflictException(
          'Cannot delete institution with related classes or contracts',
        );
      }
      throw new InternalServerErrorException('Failed to delete institution', {
        cause: error,
      });
    }
  }
}
