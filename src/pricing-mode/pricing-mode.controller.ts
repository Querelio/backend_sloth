import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PricingMode } from '../generated/prisma/client';
import { PricingModeService } from './pricing-mode.service';

@ApiTags('pricing-mode')
@ApiBearerAuth('JWT')
@Controller('pricing-mode')
export class PricingModeController {
  constructor(private readonly pricingModeService: PricingModeService) {}

  @Get()
  @ApiOperation({ summary: 'List all pricing modes' })
  @ApiOkResponse({ description: 'List of pricing modes' })
  findAll(): Promise<PricingMode[]> {
    return this.pricingModeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pricing mode by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Pricing mode' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PricingMode> {
    return this.pricingModeService.findOne(id);
  }
}
