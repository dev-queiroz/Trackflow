import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

const mockEventsService = {
  create: jest.fn(),
  findAll: jest.fn(),
};

describe('EventsController', () => {
  let controller: EventsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: mockEventsService }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call eventsService.create and return result', async () => {
      const dto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        eventName: 'button_clicked',
        metadata: { page: 'checkout' },
      };
      const expectedResult = {
        message: 'Evento registrado com sucesso',
        event: { id: 'event-1', ...dto, createdAt: new Date() },
      };
      mockEventsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(result).toEqual(expectedResult);
      expect(mockEventsService.create).toHaveBeenCalledWith(dto);
    });

    it('should propagate errors from eventsService.create', async () => {
      const dto = { userId: '', eventName: 'click', metadata: {} };
      mockEventsService.create.mockRejectedValue(new Error('Bad Request'));

      await expect(controller.create(dto)).rejects.toThrow('Bad Request');
    });
  });

  describe('findAll', () => {
    it('should use defaults when no params provided', async () => {
      mockEventsService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll();

      expect(mockEventsService.findAll).toHaveBeenCalledWith(1, 50);
    });

    it('should use custom page and limit', async () => {
      mockEventsService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll(2, 10);

      expect(mockEventsService.findAll).toHaveBeenCalledWith(2, 10);
    });

    it('should use default limit when only page is provided', async () => {
      mockEventsService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll(3, undefined);

      expect(mockEventsService.findAll).toHaveBeenCalledWith(3, 50);
    });

    it('should use default page when only limit is provided', async () => {
      mockEventsService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll(undefined, 25);

      expect(mockEventsService.findAll).toHaveBeenCalledWith(1, 25);
    });

    it('should handle undefined page and limit explicitly', async () => {
      mockEventsService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll(undefined, undefined);

      expect(mockEventsService.findAll).toHaveBeenCalledWith(1, 50);
    });
  });
});
