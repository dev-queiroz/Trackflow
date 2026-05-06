import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;

  const userActor = {
    id: 'u1',
    email: 'u@u.com',
    name: 'U',
    role: Role.USER,
  };

  const adminActor = {
    id: 'a1',
    email: 'a@a.com',
    name: 'A',
    role: Role.ADMIN,
  };

  const mockPrisma = {
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll pagina corretamente', async () => {
    const result = await service.findAll(2, 10);
    expect(result).toEqual({
      data: [],
      meta: { page: 2, limit: 10, total: 0, totalPages: 0 },
    });
  });

  it('findOne permite self', async () => {
    const row = {
      id: 'u1',
      email: 'u@u.com',
      name: 'U',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrisma.user.findUnique.mockResolvedValueOnce(row);

    await expect(service.findOne('u1', userActor)).resolves.toEqual(row);
  });

  it('findOne nega outro usuário sem admin', async () => {
    await expect(service.findOne('other', userActor)).rejects.toThrow(
      ForbiddenException,
    );
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('findOne permite admin para qualquer id', async () => {
    const row = {
      id: 'x',
      email: 'x@x.com',
      name: 'X',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrisma.user.findUnique.mockResolvedValueOnce(row);

    await expect(service.findOne('x', adminActor)).resolves.toEqual(row);
  });

  it('findOne NotFound', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    await expect(service.findOne('u1', userActor)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('adminCreate detecta email duplicado', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'x' });
    await expect(
      service.adminCreate({
        email: 'dup@test.com',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('remove retorna deleted', async () => {
    mockPrisma.user.delete.mockResolvedValueOnce({});
    await expect(service.remove('u1', userActor)).resolves.toEqual({
      deleted: true,
      id: 'u1',
    });
  });
});
