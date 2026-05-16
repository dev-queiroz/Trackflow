import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const dto = {
        email: 'test@test.com',
        password: 'password123',
        name: 'Test',
      };
      const expectedResult = {
        message: 'User created successfully',
        user: {
          id: 'uuid-1',
          email: dto.email,
          name: dto.name,
          createdAt: new Date(),
        },
      };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(dto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });

    it('should propagate errors from authService.register', async () => {
      const dto = { email: 'dup@test.com', password: 'password123' };
      mockAuthService.register.mockRejectedValue(new Error('Conflict'));

      await expect(controller.register(dto)).rejects.toThrow('Conflict');
    });
  });

  describe('login', () => {
    it('should call authService.login and return token', async () => {
      const dto = { email: 'test@test.com', password: 'password123' };
      const expectedResult = {
        access_token: 'jwt-token',
        user: { id: 'uuid-1', email: dto.email, name: 'Test' },
      };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(dto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });

    it('should propagate errors from authService.login', async () => {
      const dto = { email: 'bad@test.com', password: 'wrong' };
      mockAuthService.login.mockRejectedValue(new Error('Unauthorized'));

      await expect(controller.login(dto)).rejects.toThrow('Unauthorized');
    });
  });
});
