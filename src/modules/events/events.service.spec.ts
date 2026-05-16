import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

const mockPrismaService = {
  event: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createEventDto = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      eventName: 'button_clicked',
      metadata: { page: 'checkout' },
    };

    it('should create an event successfully', async () => {
      const mockEvent = {
        id: 'event-uuid',
        eventName: 'button_clicked',
        metadata: { page: 'checkout' },
        createdAt: new Date('2026-01-01'),
        user: {
          id: createEventDto.userId,
          email: 'test@test.com',
          name: 'Test',
        },
      };
      mockPrismaService.event.create.mockResolvedValue(mockEvent);

      const result = await service.create(createEventDto);

      expect(result).toEqual({
        message: 'Event recorded successfully',
        event: {
          id: mockEvent.id,
          eventName: mockEvent.eventName,
          metadata: mockEvent.metadata,
          createdAt: mockEvent.createdAt,
        },
      });
      expect(mockPrismaService.event.create).toHaveBeenCalledWith({
        data: {
          userId: createEventDto.userId,
          eventName: createEventDto.eventName,
          metadata: createEventDto.metadata,
        },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });
    });

    it('should create event with empty metadata when metadata is undefined', async () => {
      const dtoWithoutMetadata = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        eventName: 'page_view',
        metadata: undefined,
      };
      const mockEvent = {
        id: 'event-uuid-2',
        eventName: 'page_view',
        metadata: {},
        createdAt: new Date(),
        user: {
          id: dtoWithoutMetadata.userId,
          email: 'test@test.com',
          name: 'Test',
        },
      };
      mockPrismaService.event.create.mockResolvedValue(mockEvent);

      const result = await service.create(dtoWithoutMetadata);

      expect(result.message).toBe('Event recorded successfully');
      expect(mockPrismaService.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadata: {},
          }),
        }),
      );
    });

    it('should throw BadRequestException when userId is empty', async () => {
      const dto = { userId: '', eventName: 'click', metadata: {} };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('userId is required');
    });

    it('should throw BadRequestException when eventName is empty', async () => {
      const dto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        eventName: '',
        metadata: {},
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'eventName is required',
      );
    });

    it('should throw BadRequestException when prisma throws an error', async () => {
      mockPrismaService.event.create.mockRejectedValue(new Error('DB error'));

      await expect(service.create(createEventDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated events with default params', async () => {
      const mockEvents = [
        { id: 'e1', eventName: 'click', metadata: {}, createdAt: new Date() },
      ];
      mockPrismaService.event.findMany.mockResolvedValue(mockEvents);
      mockPrismaService.event.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result).toEqual({
        data: mockEvents,
        meta: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
        },
      });
      expect(mockPrismaService.event.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });
    });

    it('should return paginated events with custom page and limit', async () => {
      mockPrismaService.event.findMany.mockResolvedValue([]);
      mockPrismaService.event.count.mockResolvedValue(100);

      const result = await service.findAll(3, 10);

      expect(result.meta).toEqual({
        page: 3,
        limit: 10,
        total: 100,
        totalPages: 10,
      });
      expect(mockPrismaService.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it('should calculate totalPages correctly with remainder', async () => {
      mockPrismaService.event.findMany.mockResolvedValue([]);
      mockPrismaService.event.count.mockResolvedValue(55);

      const result = await service.findAll(1, 10);

      expect(result.meta.totalPages).toBe(6);
    });

    it('should handle empty result set', async () => {
      mockPrismaService.event.findMany.mockResolvedValue([]);
      mockPrismaService.event.count.mockResolvedValue(0);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });
});
