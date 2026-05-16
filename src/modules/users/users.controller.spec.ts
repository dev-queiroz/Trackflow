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

  it('findAll delegates pagination', async () => {
    await expect(controller.findAll({ page: 2, limit: 10 })).resolves.toEqual({
      data: [],
      meta: {},
    });
    expect(service.findAll).toHaveBeenCalledWith(2, 10);
  });

  it('findAll defaults', async () => {
    await controller.findAll({});
    expect(service.findAll).toHaveBeenCalledWith(1, 50);
  });

  it('findOne passes actor', async () => {
    await controller.findOne('1', actor);
    expect(service.findOne).toHaveBeenCalledWith('1', actor);
  });

  it('getMe', async () => {
    await expect(controller.getMe(actor)).resolves.toEqual(actor);
    expect(service.findProfile).toHaveBeenCalledWith(actor);
  });

  it('adminCreate passes dto', async () => {
    const dto = { email: 'new@test.com', password: 'pwd', name: 'New' };
    await controller.adminCreate(dto);
    expect(service.adminCreate).toHaveBeenCalledWith(dto);
  });

  it('updateMe passes id from actor', async () => {
    const dto = { name: 'New Name' };
    await controller.updateMe(actor, dto);
    expect(service.update).toHaveBeenCalledWith(actor.id, dto, actor);
  });

  it('removeMe passes id from actor', async () => {
    await controller.removeMe(actor);
    expect(service.remove).toHaveBeenCalledWith(actor.id, actor);
  });

  it('update passes id, dto and actor', async () => {
    const dto = { name: 'New Name' };
    await controller.update('u1', dto, actor);
    expect(service.update).toHaveBeenCalledWith('u1', dto, actor);
  });

  it('remove passes id and actor', async () => {
    await controller.remove('u1', actor);
    expect(service.remove).toHaveBeenCalledWith('u1', actor);
  });
});
