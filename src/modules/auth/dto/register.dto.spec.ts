import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation without optional name', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'test@example.com',
      password: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid email', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'invalid-email',
      password: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail with empty email', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: '',
      password: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with short password (less than 6 chars)', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'test@example.com',
      password: '12345',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const passwordError = errors.find((e) => e.property === 'password');
    expect(passwordError).toBeDefined();
  });

  it('should fail with empty password', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'test@example.com',
      password: '',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with missing email and password', async () => {
    const dto = plainToInstance(RegisterDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
