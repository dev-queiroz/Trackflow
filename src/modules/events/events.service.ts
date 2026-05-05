import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventDto) {
    // Validação crítica conforme especificação
    if (!dto.userId) {
      throw new BadRequestException('userId é obrigatório');
    }
    if (!dto.eventName) {
      throw new BadRequestException('eventName é obrigatório');
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
        message: 'Evento registrado com sucesso',
        event: {
          id: event.id,
          eventName: event.eventName,
          metadata: event.metadata,
          createdAt: event.createdAt,
        },
      };
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      throw new BadRequestException('Erro ao processar evento');
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
