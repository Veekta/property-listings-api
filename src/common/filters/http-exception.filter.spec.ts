import { BadRequestException, NotFoundException } from '@nestjs/common';

import { HttpExceptionFilter } from './http-exception.filter.js';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  function createHost(response: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  }) {
    return {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as any;
  }

  it('should preserve an existing NestJS HTTP exception', () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const exception = new NotFoundException('Listing not found');

    filter.catch(exception, createHost(response));

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Listing not found',
      error: 'Not Found',
      statusCode: 404,
    });
  });

  it('should preserve validation error responses', () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const exception = new BadRequestException([
      'page must not be less than 1',
      'limit must not be greater than 100',
    ]);

    filter.catch(exception, createHost(response));

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      message: [
        'page must not be less than 1',
        'limit must not be greater than 100',
      ],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('should hide unexpected errors and return a 500 response', () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const exception = new Error('Database connection failed');

    filter.catch(exception, createHost(response));

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });

    expect(response.json).not.toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Database connection failed',
      }),
    );
  });
});
