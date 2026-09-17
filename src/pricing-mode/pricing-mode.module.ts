import { Module } from '@nestjs/common';
import { PricingModeService } from './pricing-mode.service';
import { PricingModeController } from './pricing-mode.controller';

@Module({
  controllers: [PricingModeController],
  providers: [PricingModeService],
})
export class PricingModeModule {}
