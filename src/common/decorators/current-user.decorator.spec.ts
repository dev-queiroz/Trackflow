import { ExecutionContext } from '@nestjs/common';
import { getCurrentUserByContext } from './current-user.decorator';
import { Role } from '@prisma/client';

describe('getCurrentUserByContext', () => {
  it('should return the user from the request', () => {
    const mockUser = {
      id: '123',
      email: 'test@test.com',
      name: 'Test User',
      role: Role.USER,
    };
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: mockUser,
        }),
      }),
    } as unknown as ExecutionContext;

    const result = getCurrentUserByContext(undefined, mockExecutionContext);
    expect(result).toEqual(mockUser);
  });
});
