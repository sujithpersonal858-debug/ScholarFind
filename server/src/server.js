require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('./seed/seedData');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Initialize Database connection
    await connectDB();

    // 2. Automatically ensure base seeds exist for first-time setup
    await seedDatabase();

    // 3. Start Express HTTP Server
    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`ScholarFind Backend running at: http://localhost:${PORT}`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('Failed to start ScholarFind server:', error);
    process.exit(1);
  }
}

startServer();
