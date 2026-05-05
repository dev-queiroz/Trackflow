import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateEventDto } from './create-event.dto';

describe('CreateEventDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(CreateEventDto, {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      eventName: 'button_clicked',
      metadata: { page: 'checkout' },
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation without optional metadata', async () => {
    const dto = plainToInstance(CreateEventDto, {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      eventName: 'page_view',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid UUID for userId', async () => {
    const dto = plainToInstance(CreateEventDto, {
      userId: 'not-a-uuid',
      eventName: 'click',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('userId');
  });

  it('should fail with empty userId', async () => {
    const dto = plainToInstance(CreateEventDto, {
      userId: '',
      eventName: 'click',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with empty eventName', async () => {
    const dto = plainToInstance(CreateEventDto, {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      eventName: '',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with non-object metadata', async () => {
    const dto = plainToInstance(CreateEventDto, {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      eventName: 'click',
      metadata: 'invalid',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const metadataError = errors.find((e) => e.property === 'metadata');
    expect(metadataError).toBeDefined();
  });

  it('should fail with missing required fields', async () => {
    const dto = plainToInstance(CreateEventDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
