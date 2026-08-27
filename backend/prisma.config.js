/**
 * prisma.config.js — Prisma 7 Configuration File
 *
 * Prisma 7 moved the database connection URL out of schema.prisma and into
 * this config file. This file configures:
 *
 *  - datasource.url   : Your PostgreSQL connection string (from .env)
 *  - schema           : Path to schema.prisma
 *  - migrations.path  : Where migration files are stored
 *  - migrations.seed  : Command to run your seed script
 *
 * IMPORTANT: This file must exist in the project root (next to package.json).
 * Prisma CLI automatically discovers it.
 *
 * Reference: https://pris.ly/d/config-datasource
 */

require('dotenv').config();

const { defineConfig, env } = require('prisma/config');

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },

  datasource: {
    // Reads DATABASE_URL from your .env file
    url: env('DATABASE_URL'),
  },
});
