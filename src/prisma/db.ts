import 'dotenv/config';
import postgis from '@prisma/orm-extension-postgis/runtime';
import postgres from '@prisma/orm-postgres/runtime';

import type { Contract } from '../../prisma/contract.d.js';
import contractJson from '../../prisma/contract.json' with { type: 'json' };

export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
  extensions: [postgis],
});
