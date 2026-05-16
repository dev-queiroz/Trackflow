import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

describe('PaginationQueryDto', () => {
  it('should validate correctly with valid data', async () => {
    const data = { page: '2', limit: '10' };
    const dto = plainToInstance(PaginationQueryDto, data);
    const errors = await validate(dto);
    
    expect(errors.length).toBe(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(10);
  });

  it('should allow optional fields', async () => {
    const data = {};
    const dto = plainToInstance(PaginationQueryDto, data);
    const errors = await validate(dto);
    
    expect(errors.length).toBe(0);
    expect(dto.page).toBeUndefined();
    expect(dto.limit).toBeUndefined();
  });

  it('should fail with invalid data', async () => {
    const data = { page: '0', limit: '200' };
    const dto = plainToInstance(PaginationQueryDto, data);
    const errors = await validate(dto);
    
    expect(errors.length).toBeGreaterThan(0);
  });
});
