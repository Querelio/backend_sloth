import { Test, TestingModule } from '@nestjs/testing';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';

describe('StatusController', () => {
  let controller: StatusController;
  let service: jest.Mocked<Pick<StatusService, 'findAll' | 'findOne'>>;

  const status = { id: 1, name: 'Planifiée' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusController],
      providers: [
        {
          provide: StatusService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StatusController>(StatusController);
    service = module.get(StatusService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list statuses', async () => {
    service.findAll.mockResolvedValue([status]);

    await expect(controller.findAll()).resolves.toEqual([status]);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('should get a status by ID', async () => {
    service.findOne.mockResolvedValue(status);

    await expect(controller.findOne(1)).resolves.toEqual(status);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });
});
