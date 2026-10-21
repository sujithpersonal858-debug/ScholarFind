require('dotenv').config();
const { connectDB } = require('../config/db');
const repository = require('../config/repository');
const { SCHOLARSHIPS_CATALOGUE } = require('../seed/scholarshipsData');

async function runBulkImport() {
  console.log('====================================================');
  console.log('📥 SCHOLARFIND BULK SCHOLARSHIP IMPORT & SYNC');
  console.log('====================================================');

  try {
    // 1. Initialize DB connection
    await connectDB();

    console.log(`Found ${SCHOLARSHIPS_CATALOGUE.length} verified scholarship records in catalogue.`);
    console.log('Starting bulk upsert with duplicate prevention...');

    const result = await repository.scholarships.bulkUpsert(SCHOLARSHIPS_CATALOGUE);

    console.log('\n====================================================');
    console.log('📊 IMPORT RESULTS');
    console.log('====================================================');
    console.log(`Total In Catalogue:  ${result.total}`);
    console.log(`New Inserted:        ${result.inserted}`);
    console.log(`Updated Existing:    ${result.updated}`);
    console.log(`Skipped / Errors:    ${result.skipped}`);
    console.log(`Needs Verification:  ${result.unverified}`);
    console.log('====================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Fatal bulk import error:', error);
    process.exit(1);
  }
}

runBulkImport();
