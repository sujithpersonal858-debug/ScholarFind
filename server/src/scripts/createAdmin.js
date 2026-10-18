require('dotenv').config();
const bcrypt = require('bcryptjs');
const repository = require('../config/repository');
const { connectDB } = require('../config/db');

async function createAdmin() {
  try {
    // 1. Connect to database
    await connectDB();

    // 2. Determine credentials from CLI arguments, environment variables, or secure fallback
    const args = process.argv.slice(2);
    const email = args[0] || process.env.ADMIN_EMAIL || 'admin@scholarfind.com';
    const password = args[1] || process.env.ADMIN_PASSWORD || 'Admin@1234';
    const name = args[2] || process.env.ADMIN_NAME || 'ScholarFind Administrator';

    if (!email || !password) {
      console.error('Error: Email and password are required to create an administrator account.');
      console.log('Usage: node src/scripts/createAdmin.js <email> <password> [name]');
      process.exit(1);
    }

    const cleanEmail = email.trim().toLowerCase();

    // 3. Hash password securely with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Check if account already exists
    const existing = await repository.users.findByEmail(cleanEmail);

    if (existing) {
      // Update existing account to have admin privileges and new password
      await repository.users.updateStatus(existing._id, {
        name: name.trim(),
        password: hashedPassword,
        role: 'admin'
      });
      console.log('====================================================');
      console.log('✅ ScholarFind Administrator Account Updated:');
      console.log(`   Email: ${cleanEmail}`);
      console.log(`   Name:  ${name}`);
      console.log('   Role:  admin');
      console.log('====================================================');
    } else {
      // Create new administrator account
      const newUser = await repository.users.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('====================================================');
      console.log('✅ New ScholarFind Administrator Account Created:');
      console.log(`   ID:    ${newUser._id}`);
      console.log(`   Email: ${cleanEmail}`);
      console.log(`   Name:  ${name}`);
      console.log('   Role:  admin');
      console.log('====================================================');
    }

    console.log('You can now log in at http://localhost:5173/login?role=admin');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create administrator account:', error);
    process.exit(1);
  }
}

createAdmin();
