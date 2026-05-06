import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const actor = {
    id: 'u1',
    email: 'u@u.com',
    name: 'User',
    role: Role.USER,
  };

  beforeEach(async () => {
    const mockUsersService = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findOne: jest.fn().mockResolvedValue({ id: '1', email: 'test@test.com' }),
      findProfile: jest.fn().mockResolvedValue(actor),
      adminCreate: jest.fn(),
      update: jest.fn(),
      remove: jest.fn().mockResolvedValue({ deleted: true, id: 'u1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delega paginação', async () => {
    await expect(
      controller.findAll({ page: 2, limit: 10 }),
    ).resolves.toEqual({ data: [], meta: {} });
    expect(service.findAll).toHaveBeenCalledWith(2, 10);
  });

  it('findAll defaults', async () => {
    await controller.findAll({});
    expect(service.findAll).toHaveBeenCalledWith(1, 50);
  });

  it('findOne passa ator', async () => {
    await controller.findOne('1', actor);
    expect(service.findOne).toHaveBeenCalledWith('1', actor);
  });

  it('getMe', async () => {
    await expect(controller.getMe(actor)).resolves.toEqual(actor);
    expect(service.findProfile).toHaveBeenCalledWith(actor);
  });
});
