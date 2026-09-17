import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PricingMode } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PricingModeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PricingMode[]> {
    try {
      return await this.prisma.pricingMode.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch pricing modes', {
        cause: error,
      });
    }
  }

  async findOne(id: number): Promise<PricingMode> {
    try {
      const pricingMode = await this.prisma.pricingMode.findUnique({
        where: { id },
      });

      if (!pricingMode) {
        throw new NotFoundException(`Pricing mode #${id} not found`);
      }

      return pricingMode;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch pricing mode', {
        cause: error,
      });
    }
  }
}
