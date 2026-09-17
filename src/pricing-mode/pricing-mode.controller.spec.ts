import { Test, TestingModule } from '@nestjs/testing';
import { PricingModeController } from './pricing-mode.controller';
import { PricingModeService } from './pricing-mode.service';

describe('PricingModeController', () => {
  let controller: PricingModeController;
  let service: jest.Mocked<Pick<PricingModeService, 'findAll' | 'findOne'>>;

  const pricingMode = { id: 1, name: 'Hourly' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PricingModeController],
      providers: [
        {
          provide: PricingModeService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PricingModeController>(PricingModeController);
    service = module.get(PricingModeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list pricing modes', async () => {
    service.findAll.mockResolvedValue([pricingMode]);

    await expect(controller.findAll()).resolves.toEqual([pricingMode]);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('should get a pricing mode by ID', async () => {
    service.findOne.mockResolvedValue(pricingMode);

    await expect(controller.findOne(1)).resolves.toEqual(pricingMode);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });
});
