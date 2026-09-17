import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import {
  formatDateOnly,
  formatTimeOnly,
  toPrismaDate,
} from '../common/date-format';
import { ownedBy } from '../common/ownership';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_INSTITUTION_COLOR = '#3B82F6';

const agendaSessionInclude = {
  class: {
    select: {
      id: true,
      name: true,
      classLevel: true,
      institution: {
        select: { id: true, color: true },
      },
    },
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

type AgendaSession = Prisma.SessionGetPayload<{
  include: typeof agendaSessionInclude;
}>;
type FormattedAgendaSession = Omit<
  AgendaSession,
  'date' | 'start' | 'end' | 'declarationDate'
> & {
  date: string;
  start: string;
  end: string;
  declarationDate: string | null;
  color: string;
};

export type { FormattedAgendaSession };

function resolveSessionColor(session: AgendaSession): string {
  return session.class?.institution?.color ?? DEFAULT_INSTITUTION_COLOR;
}

function formatAgendaSession(session: AgendaSession): FormattedAgendaSession {
  return {
    ...session,
    date: formatDateOnly(session.date),
    start: formatTimeOnly(session.start),
    end: formatTimeOnly(session.end),
    declarationDate: formatDateOnly(session.declarationDate),
    color: resolveSessionColor(session),
  };
}

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  async findSessions(userId: number): Promise<FormattedAgendaSession[]> {
    try {
      const sessions = await this.prisma.session.findMany({
        where: ownedBy(userId),
        include: agendaSessionInclude,
      });

      return sessions.map(formatAgendaSession);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch agenda sessions',
        {
          cause: error,
        },
      );
    }
  }

  async findSessionsByDate(
    date: string,
    userId: number,
  ): Promise<FormattedAgendaSession[]> {
    const { startOfDay, startOfNextDay } = this.parseSessionDate(date);

    try {
      const sessions = await this.prisma.session.findMany({
        where: {
          ...ownedBy(userId),
          date: {
            gte: startOfDay,
            lt: startOfNextDay,
          },
        },
        include: agendaSessionInclude,
      });

      return sessions.map(formatAgendaSession);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch agenda sessions by date',
        { cause: error },
      );
    }
  }

  private parseSessionDate(date: string): {
    startOfDay: Date;
    startOfNextDay: Date;
  } {
    const startOfDay = toPrismaDate(date);
    const startOfNextDay = new Date(startOfDay);
    startOfNextDay.setUTCDate(startOfDay.getUTCDate() + 1);

    return { startOfDay, startOfNextDay };
  }
}
