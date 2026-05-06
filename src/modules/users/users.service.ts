import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayloadUser } from '../../common/interfaces/jwt-payload-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';

const publicSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private assertSelfOrAdmin(actor: JwtPayloadUser, targetId: string) {
    if (actor.role !== Role.ADMIN && actor.id !== targetId) {
      throw new ForbiddenException('Permissão negada');
    }
  }

  async findAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: publicSelect,
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, actor: JwtPayloadUser) {
    this.assertSelfOrAdmin(actor, id);
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicSelect,
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async findProfile(actor: JwtPayloadUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: actor.id },
      select: publicSelect,
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async adminCreate(dto: AdminCreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email já está em uso');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        role: dto.role ?? Role.USER,
      },
      select: publicSelect,
    });
  }

  async update(id: string, dto: UpdateUserDto, actor: JwtPayloadUser) {
    this.assertSelfOrAdmin(actor, id);

    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (dto.email && dto.email !== existing.email) {
      const taken = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (taken) {
        throw new ConflictException('Email já está em uso');
      }
    }

    const data: {
      email?: string;
      name?: string | null;
      password?: string;
    } = {};

    if (dto.email !== undefined) data.email = dto.email;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.password !== undefined) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: publicSelect,
    });
  }

  async remove(id: string, actor: JwtPayloadUser) {
    this.assertSelfOrAdmin(actor, id);

    try {
      await this.prisma.user.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Usuário não encontrado');
    }

    return { deleted: true, id };
  }
}
