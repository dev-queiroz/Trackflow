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

  it('findAll paginates correctly', async () => {
    const result = await service.findAll(2, 10);
    expect(result).toEqual({
      data: [],
      meta: { page: 2, limit: 10, total: 0, totalPages: 0 },
    });
  });

  it('findOne allows self', async () => {
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

  it('findOne denies another user without admin', async () => {
    await expect(service.findOne('other', userActor)).rejects.toThrow(
      ForbiddenException,
    );
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('findOne allows admin for any id', async () => {
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

  it('adminCreate detects duplicate email', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'x' });
    await expect(
      service.adminCreate({
        email: 'dup@test.com',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('findProfile returns user', async () => {
    const row = {
      id: 'u1',
      email: 'u@u.com',
      name: 'U',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrisma.user.findUnique.mockResolvedValueOnce(row);

    await expect(service.findProfile(userActor)).resolves.toEqual(row);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userActor.id },
      select: expect.any(Object),
    });
  });

  it('findProfile throws NotFound if user missing', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    await expect(service.findProfile(userActor)).rejects.toThrow(NotFoundException);
  });

  it('adminCreate creates user with hashed password', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce({ id: 'new', email: 'new@test.com' });

    const result = await service.adminCreate({
      email: 'new@test.com',
      password: 'password123',
      name: 'New User',
    });

    expect(result).toEqual({ id: 'new', email: 'new@test.com' });
    expect(mockPrisma.user.create).toHaveBeenCalled();
    const callArgs = mockPrisma.user.create.mock.calls[0][0];
    expect(callArgs.data.email).toBe('new@test.com');
    expect(callArgs.data.password).not.toBe('password123'); // Should be hashed
  });

  it('update modifies user data', async () => {
    const existing = { id: 'u1', email: 'old@test.com' };
    mockPrisma.user.findUnique.mockResolvedValueOnce(existing);
    mockPrisma.user.update.mockResolvedValueOnce({ ...existing, name: 'Updated' });

    const result = await service.update('u1', { name: 'Updated' }, userActor);

    expect(result.name).toBe('Updated');
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u1' },
        data: { name: 'Updated' },
      }),
    );
  });

  it('update throws Conflict if email already taken', async () => {
    const existing = { id: 'u1', email: 'old@test.com' };
    mockPrisma.user.findUnique
      .mockResolvedValueOnce(existing) // First call for existence check
      .mockResolvedValueOnce({ id: 'other', email: 'taken@test.com' }); // Second call for email check

    await expect(
      service.update('u1', { email: 'taken@test.com' }, userActor),
    ).rejects.toThrow(ConflictException);
  });

  it('update handles password hashing', async () => {
    const existing = { id: 'u1', email: 'old@test.com' };
    mockPrisma.user.findUnique.mockResolvedValueOnce(existing);
    mockPrisma.user.update.mockResolvedValueOnce({ ...existing });

    await service.update('u1', { password: 'new-password' }, userActor);

    const callArgs = mockPrisma.user.update.mock.calls[0][0];
    expect(callArgs.data.password).toBeDefined();
    expect(callArgs.data.password).not.toBe('new-password');
  });

  it('update throws NotFound if user missing', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    await expect(service.update('u1', {}, userActor)).rejects.toThrow(NotFoundException);
  });

  it('remove throws NotFound if delete fails', async () => {
    mockPrisma.user.delete.mockRejectedValueOnce(new Error('Prisma error'));
    await expect(service.remove('u1', userActor)).rejects.toThrow(NotFoundException);
  });
});
