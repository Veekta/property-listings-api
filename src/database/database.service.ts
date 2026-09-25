import { Injectable } from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class DatabaseService {
  get client() {
    return db;
  }

  async checkConnection(): Promise<boolean> {
    await db.orm.public.Agent.all();
    return true;
  }
}
