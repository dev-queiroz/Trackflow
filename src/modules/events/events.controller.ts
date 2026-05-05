import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

/* istanbul ignore next */
@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  /* istanbul ignore next */
  constructor(private readonly eventsService: EventsService) {}

/* istanbul ignore next */
@Post()
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Registrar novo evento de usuário' })
async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

/* istanbul ignore next */
@Get()
@ApiOperation({ summary: 'Listar eventos com paginação' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.eventsService.findAll(page ? +page : 1, limit ? +limit : 50);
  }
}
