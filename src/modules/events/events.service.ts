import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventDto) {
    if (!dto.userId) {
      throw new BadRequestException('userId is required');
    }
    if (!dto.eventName) {
      throw new BadRequestException('eventName is required');
    }

    try {
      const event = await this.prisma.event.create({
        data: {
          userId: dto.userId,
          eventName: dto.eventName,
          metadata: dto.metadata || {},
        },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });

      return {
        message: 'Event recorded successfully',
        event: {
          id: event.id,
          eventName: event.eventName,
          metadata: event.metadata,
          createdAt: event.createdAt,
        },
      };
    } catch (error) {
      console.error('Error saving event:', error);
      throw new BadRequestException('Error processing event');
    }
  }

  async findAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      }),
      this.prisma.event.count(),
    ]);

    return {
      data: events,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
