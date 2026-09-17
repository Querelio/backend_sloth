import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Contract, Prisma } from '../generated/prisma/client';
import { CreatedResourceDto } from '../common/dto/created-resource.dto';
import { formatDateOnly, toPrismaDate } from '../common/date-format';
import { assertRecordExists, ownedBy } from '../common/ownership';
import {
  isForeignKeyConstraintError,
  isPrismaNotFoundError,
} from '../common/prisma-errors';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

const contractInclude = {
  institution: {
    select: { id: true, name: true },
  },
  pricingMode: {
    select: { id: true, name: true },
  },
  teacher: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
} satisfies Prisma.ContractInclude;

type ContractWithRelations = Prisma.ContractGetPayload<{
  include: typeof contractInclude;
}>;
type FormattedContract<T extends Contract = Contract> = Omit<
  T,
  'startDate' | 'endDate'
> & {
  startDate: string;
  endDate: string;
};

export type FormattedContractWithRelations =
  FormattedContract<ContractWithRelations>;
export type { FormattedContract };

function normalizeContractCreateData(
  createContractDto: CreateContractDto,
  teacherId: number,
): Prisma.ContractUncheckedCreateInput {
  return {
    ...createContractDto,
    teacherId,
    startDate: toPrismaDate(createContractDto.startDate),
    endDate: toPrismaDate(createContractDto.endDate),
  };
}

function normalizeContractUpdateData(
  updateContractDto: UpdateContractDto,
): Prisma.ContractUncheckedUpdateInput {
  return {
    ...updateContractDto,
    ...(updateContractDto.startDate && {
      startDate: toPrismaDate(updateContractDto.startDate),
    }),
    ...(updateContractDto.endDate && {
      endDate: toPrismaDate(updateContractDto.endDate),
    }),
  };
}

function formatContract<T extends Contract>(contract: T): FormattedContract<T> {
  return {
    ...contract,
    startDate: formatDateOnly(contract.startDate),
    endDate: formatDateOnly(contract.endDate),
  };
}

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createContractDto: CreateContractDto,
    teacherId: number,
  ): Promise<CreatedResourceDto> {
    await this.assertPublicRelations(
      createContractDto.institutionId,
      createContractDto.pricingModeId,
    );

    try {
      return await this.prisma.contract.create({
        data: normalizeContractCreateData(createContractDto, teacherId),
        select: { id: true },
      });
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        throw new BadRequestException(
          'Invalid institutionId, pricingModeId or teacherId',
        );
      }
      throw new InternalServerErrorException('Failed to create contract', {
        cause: error,
      });
    }
  }

  async findAll(userId: number): Promise<FormattedContractWithRelations[]> {
    try {
      const contracts = await this.prisma.contract.findMany({
        where: ownedBy(userId),
        include: contractInclude,
      });
      return contracts.map(formatContract);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch contracts', {
        cause: error,
      });
    }
  }

  async findOne(
    id: number,
    userId: number,
  ): Promise<FormattedContractWithRelations> {
    try {
      const contract = await this.prisma.contract.findFirst({
        where: { id, ...ownedBy(userId) },
        include: contractInclude,
      });

      if (!contract) {
        throw new NotFoundException(`Contract #${id} not found`);
      }

      return formatContract(contract);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch contract', {
        cause: error,
      });
    }
  }

  async update(
    id: number,
    updateContractDto: UpdateContractDto,
    userId: number,
  ): Promise<FormattedContract<Contract>> {
    await this.findOne(id, userId);

    if (updateContractDto.institutionId !== undefined) {
      await this.assertInstitutionExists(updateContractDto.institutionId);
    }
    if (updateContractDto.pricingModeId !== undefined) {
      await this.assertPricingModeExists(updateContractDto.pricingModeId);
    }

    try {
      const contract = await this.prisma.contract.update({
        where: { id },
        data: normalizeContractUpdateData(updateContractDto),
      });

      return formatContract(contract);
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`Contract #${id} not found`);
      }
      if (isForeignKeyConstraintError(error)) {
        throw new BadRequestException(
          'Invalid institutionId, pricingModeId or teacherId',
        );
      }
      throw new InternalServerErrorException('Failed to update contract', {
        cause: error,
      });
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.findOne(id, userId);

    try {
      await this.prisma.contract.delete({ where: { id } });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`Contract #${id} not found`);
      }
      if (isForeignKeyConstraintError(error)) {
        throw new ConflictException(
          'Cannot delete contract with related sessions',
        );
      }
      throw new InternalServerErrorException('Failed to delete contract', {
        cause: error,
      });
    }
  }

  private async assertPublicRelations(
    institutionId: number,
    pricingModeId: number,
  ): Promise<void> {
    await this.assertInstitutionExists(institutionId);
    await this.assertPricingModeExists(pricingModeId);
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

  private async assertPricingModeExists(pricingModeId: number): Promise<void> {
    await assertRecordExists(
      () =>
        this.prisma.pricingMode.findUnique({
          where: { id: pricingModeId },
          select: { id: true },
        }),
      'pricingModeId',
    );
  }
}
