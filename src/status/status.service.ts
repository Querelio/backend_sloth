import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Status } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatusService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Status[]> {
    try {
      return await this.prisma.status.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch statuses', {
        cause: error,
      });
    }
  }

  async findOne(id: number): Promise<Status> {
    try {
      const status = await this.prisma.status.findUnique({
        where: { id },
      });

      if (!status) {
        throw new NotFoundException(`Status #${id} not found`);
      }

      return status;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch status', {
        cause: error,
      });
    }
  }
}
