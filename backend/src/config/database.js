/**
 * src/config/database.js — Prisma Client Singleton (Prisma 7 with pg adapter)
 *
 * In Prisma 7, direct PostgreSQL connections require a driver adapter (@prisma/adapter-pg).
 * We create a pg Pool connection using DATABASE_URL from .env and pass it to PrismaClient.
 *
 * Why a singleton?
 * Prisma warns that multiple PrismaClient instances in the same process
 * can exhaust the database connection pool. This module ensures only
 * one instance is created per process.
 *
 * In development, the instance is attached to `global` so nodemon
 * hot-reloads don't create a new instance on each file save.
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/capacity_connect';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const clientConfig = {
  adapter,
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error', 'warn'],
};

// Singleton pattern
const prisma =
  process.env.NODE_ENV === 'production'
    ? new PrismaClient(clientConfig)
    : global.prisma || (global.prisma = new PrismaClient(clientConfig));

module.exports = prisma;
