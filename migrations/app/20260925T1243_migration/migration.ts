#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/92bdd1e36f453a0b1e65444e1607bfca28174632d0d88c0e6b1233d377e3fea5/contract';
import endContract from '../../snapshots/92bdd1e36f453a0b1e65444e1607bfca28174632d0d88c0e6b1233d377e3fea5/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'agent',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'listing',
        columns: [
          col('agentId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('bedrooms', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('location', 'geometry(Geometry,4326)', {
            notNull: true,
            codecRef: { codecId: 'pg/geometry@1', typeParams: { srid: 4326 } },
          }),
          col('price', 'numeric', { notNull: true, codecRef: { codecId: 'pg/numeric@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'listing_type_check_b830bd8a',
            "\"type\" IN ('RENT', 'SALE', 'SHORTLET')",
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'agent',
        constraint: 'agent_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'listing',
        index: 'listing_agentId_idx_8d0ba4f0',
        columns: ['agentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'listing',
        index: 'listing_bedrooms_idx_7c265d82',
        columns: ['bedrooms'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'listing',
        index: 'listing_price_idx_696ad5eb',
        columns: ['price'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'listing',
        index: 'listing_type_idx_b6b604ea',
        columns: ['type'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'listing',
        foreignKey: {
          name: 'listing_agentId_fkey',
          columns: ['agentId'],
          references: { schema: 'public', table: 'agent', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
