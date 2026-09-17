import { Test, TestingModule } from '@nestjs/testing';
import { AgendaController } from './agenda.controller';
import { AgendaService } from './agenda.service';

describe('AgendaController', () => {
  let controller: AgendaController;
  let agendaService: {
    findSessions: jest.Mock;
    findSessionsByDate: jest.Mock;
  };

  const sessions = [{ id: 1, title: 'Math lesson' }];

  beforeEach(async () => {
    agendaService = {
      findSessions: jest.fn(),
      findSessionsByDate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgendaController],
      providers: [
        {
          provide: AgendaService,
          useValue: agendaService,
        },
      ],
    }).compile();

    controller = module.get<AgendaController>(AgendaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list agenda sessions', async () => {
    agendaService.findSessions.mockResolvedValue(sessions);

    await expect(controller.findSessions({ sub: 7 })).resolves.toEqual(sessions);
    expect(agendaService.findSessions).toHaveBeenCalledWith(7);
  });

  it('should list agenda sessions by date', async () => {
    agendaService.findSessionsByDate.mockResolvedValue(sessions);

    await expect(
      controller.findSessionsByDate({ date: '2026-07-01' }, { sub: 7 }),
    ).resolves.toEqual(sessions);
    expect(agendaService.findSessionsByDate).toHaveBeenCalledWith(
      '2026-07-01',
      7,
    );
  });
});
