import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Session } from '../generated/prisma/client';
import { CreatedResourceDto } from '../common/dto/created-resource.dto';
import {
  formatDateOnly,
  formatTimeOnly,
  toPrismaDate,
  toPrismaTime,
} from '../common/date-format';
import {
  assertOwner,
  assertRecordExists,
  ownedBy,
} from '../common/ownership';
import {
  isForeignKeyConstraintError,
  isPrismaNotFoundError,
} from '../common/prisma-errors';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

const sessionInclude = {
  class: {
    select: { id: true, name: true, classLevel: true },
  },
  contract: {
    select: { id: true, contractNumber: true },
  },
  statusRelation: {
    select: { id: true, name: true },
  },
  teacher: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
} satisfies Prisma.SessionInclude;

type SessionWithRelations = Prisma.SessionGetPayload<{
  include: typeof sessionInclude;
}>;
type FormattedSession<T extends Session = Session> = Omit<
  T,
  'date' | 'start' | 'end' | 'declarationDate'
> & {
  date: string;
  start: string;
  end: string;
  declarationDate: string | null;
};

export type FormattedSessionWithRelations =
  FormattedSession<SessionWithRelations>;
export type { FormattedSession };

function todayAsPrismaDate(): Date {
  return toPrismaDate(new Date().toISOString().slice(0, 10));
}

function resolveDeclarationDate(
  declarationReference: string | undefined,
): Date | undefined {
  if (declarationReference === undefined) {
    return undefined;
  }

  return declarationReference.trim().length > 0
    ? todayAsPrismaDate()
    : undefined;
}

function normalizeSessionCreateData(
  createSessionDto: CreateSessionDto,
  userId: number,
): Prisma.SessionUncheckedCreateInput {
  const declarationDate = resolveDeclarationDate(
    createSessionDto.declarationReference ?? undefined,
  );
  const { statusId, ...rest } = createSessionDto;

  return {
    ...rest,
    ...(statusId !== undefined && { statusId }),
    teacherId: userId,
    date: toPrismaDate(createSessionDto.date),
    start: toPrismaTime(createSessionDto.start),
    end: toPrismaTime(createSessionDto.end),
    ...(declarationDate && { declarationDate }),
  };
}

function normalizeSessionUpdateData(
  updateSessionDto: UpdateSessionDto,
): Prisma.SessionUncheckedUpdateInput {
  const { declarationReference, statusId, ...rest } = updateSessionDto;
  const declarationDate =
    declarationReference === undefined
      ? undefined
      : declarationReference !== null && declarationReference.trim().length > 0
        ? todayAsPrismaDate()
        : null;

  return {
    ...rest,
    ...(statusId !== undefined && { statusId }),
    ...(updateSessionDto.date && {
      date: toPrismaDate(updateSessionDto.date),
    }),
    ...(updateSessionDto.start && {
      start: toPrismaTime(updateSessionDto.start),
    }),
    ...(updateSessionDto.end && {
      end: toPrismaTime(updateSessionDto.end),
    }),
    ...(declarationReference !== undefined && { declarationReference }),
    ...(declarationDate !== undefined && { declarationDate }),
  };
}

function formatSession<T extends Session>(session: T): FormattedSession<T> {
  return {
    ...session,
    date: formatDateOnly(session.date),
    start: formatTimeOnly(session.start),
    end: formatTimeOnly(session.end),
    declarationDate: formatDateOnly(session.declarationDate),
  };
}

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createSessionDto: CreateSessionDto,
    userId: number,
  ): Promise<CreatedResourceDto> {
    await this.assertSessionRelations(createSessionDto, userId);

    try {
      return await this.prisma.session.create({
        data: normalizeSessionCreateData(createSessionDto, userId),
        select: { id: true },
      });
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        throw new BadRequestException('Invalid session relation id');
      }
      throw new InternalServerErrorException('Failed to create session', {
        cause: error,
      });
    }
  }

  async findAll(userId: number): Promise<FormattedSessionWithRelations[]> {
    try {
      const sessions = await this.prisma.session.findMany({
        where: ownedBy(userId),
        include: sessionInclude,
      });
      return sessions.map(formatSession);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch sessions', {
        cause: error,
      });
    }
  }

  async findOne(
    id: number,
    userId: number,
  ): Promise<FormattedSessionWithRelations> {
    try {
      const session = await this.prisma.session.findFirst({
        where: { id, ...ownedBy(userId) },
        include: sessionInclude,
      });

      if (!session) {
        throw new NotFoundException(`Session #${id} not found`);
      }

      return formatSession(session);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch session', {
        cause: error,
      });
    }
  }

  async update(
    id: number,
    updateSessionDto: UpdateSessionDto,
    userId: number,
  ): Promise<FormattedSession> {
    await this.findOne(id, userId);
    await this.assertSessionRelations(updateSessionDto, userId);

    try {
      const session = await this.prisma.session.update({
        where: { id },
        data: normalizeSessionUpdateData(updateSessionDto),
      });

      return formatSession(session);
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`Session #${id} not found`);
      }
      if (isForeignKeyConstraintError(error)) {
        throw new BadRequestException('Invalid session relation id');
      }
      throw new InternalServerErrorException('Failed to update session', {
        cause: error,
      });
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.findOne(id, userId);

    try {
      await this.prisma.session.delete({ where: { id } });
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException(`Session #${id} not found`);
      }
      throw new InternalServerErrorException('Failed to delete session', {
        cause: error,
      });
    }
  }

  private async assertSessionRelations(
    dto: Pick<CreateSessionDto, 'classId' | 'contractId' | 'statusId'>,
    userId: number,
  ): Promise<void> {
    if (dto.contractId != null) {
      const contract = await assertRecordExists(
        () =>
          this.prisma.contract.findUnique({
            where: { id: dto.contractId as number },
            select: { teacherId: true },
          }),
        'contractId',
      );
      assertOwner(contract.teacherId, userId);
    }

    if (dto.classId != null) {
      await assertRecordExists(
        () =>
          this.prisma.class.findUnique({
            where: { id: dto.classId as number },
            select: { id: true },
          }),
        'classId',
      );
    }

    if (dto.statusId != null) {
      await assertRecordExists(
        () =>
          this.prisma.status.findUnique({
            where: { id: dto.statusId as number },
            select: { id: true },
          }),
        'statusId',
      );
    }
  }
}
