import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { DatabaseService } from '../database/database.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async check() {
    try {
      await this.databaseService.checkConnection();

      return {
        status: 'ok',
        database: 'connected',
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'disconnected',
      });
    }
  }
}
