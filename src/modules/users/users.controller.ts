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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Authenticated user profile' })
  getMe(@CurrentUser() user: JwtPayloadUser) {
    return this.usersService.findProfile(user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update own profile' })
  updateMe(@CurrentUser() user: JwtPayloadUser, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto, user);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete own account' })
  removeMe(@CurrentUser() user: JwtPayloadUser) {
    return this.usersService.remove(user.id, user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Create user' })
  adminCreate(@Body() dto: AdminCreateUserDto) {
    return this.usersService.adminCreate(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] List users' })
  findAll(@Query() query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    return this.usersService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user (self or admin)' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayloadUser) {
    return this.usersService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user (self or admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.usersService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (self or admin)' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayloadUser) {
    return this.usersService.remove(id, user);
  }
}
