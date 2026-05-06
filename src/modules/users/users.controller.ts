import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../../common/interfaces/jwt-payload-user.interface';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Perfil do usuário autenticado' })
  getMe(@CurrentUser() user: JwtPayloadUser) {
    return this.usersService.findProfile(user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar próprio perfil' })
  updateMe(
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, dto, user);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Remover própria conta' })
  removeMe(@CurrentUser() user: JwtPayloadUser) {
    return this.usersService.remove(user.id, user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Criar usuário' })
  adminCreate(@Body() dto: AdminCreateUserDto) {
    return this.usersService.adminCreate(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Listar usuários' })
  findAll(@Query() query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    return this.usersService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar usuário (próprio ou admin)' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayloadUser) {
    return this.usersService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário (próprio ou admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.usersService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover usuário (próprio ou admin)' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayloadUser) {
    return this.usersService.remove(id, user);
  }
}
