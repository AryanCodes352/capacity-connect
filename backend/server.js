/**
 * server.js — Entry point for CAPACITY CONNECT backend
 */

require('dotenv').config();

const app = require('./src/app');
const { autoBootstrap } = require('./src/utils/autoBootstrap');

const PORT = parseInt(process.env.PORT, 10) || 5000;

const server = app.listen(PORT, async () => {
  console.log(`\n🚀 CAPACITY CONNECT API is running`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Port        : ${PORT}`);
  console.log(`   URL         : http://localhost:${PORT}/api`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health\n`);

  // Ensure demo accounts and core taxonomy exist
  await autoBootstrap();
});

// Handle port conflicts cleanly
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
    console.error(`   Please terminate the other process or set a different PORT in .env (e.g. PORT=5001)\n`);
  } else {
    console.error('❌ Server error:', err.message);
  }
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
});
