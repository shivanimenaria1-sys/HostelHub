/**
 * Seed script – populates the Hostel collection in MongoDB.
 * Safe to run multiple times (uses upsert).
 *
 * Usage:
 *   node server/scripts/seedHostels.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Hostel = require('../models/Hostel');

const HOSTELS = [
  { name: 'B1',  type: 'Boys' },
  { name: 'B2',  type: 'Boys' },
  { name: 'B3',  type: 'Boys' },
  { name: 'B4',  type: 'Boys' },
  { name: 'B5',  type: 'Boys' },
  { name: 'B6',  type: 'Boys' },
  { name: 'B7',  type: 'Boys' },
  { name: 'B8',  type: 'Boys' },
  { name: 'B9',  type: 'Boys' },
  { name: 'B10', type: 'Boys' },
  { name: 'B11', type: 'Boys' },
  { name: 'B12', type: 'Boys' },
  { name: 'G1',  type: 'Girls' },
  { name: 'G2',  type: 'Girls' },
  { name: 'G3',  type: 'Girls' },
  { name: 'G4',  type: 'Girls' },
  { name: 'G5',  type: 'Girls' },
  { name: 'G6',  type: 'Girls' },
  { name: 'G7',  type: 'Girls' },
  { name: 'G8',  type: 'Girls' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostelhub');
    console.log('✅ Connected to MongoDB');

    let inserted = 0;
    let updated = 0;

    for (const hostel of HOSTELS) {
      const result = await Hostel.findOneAndUpdate(
        { name: hostel.name },
        { $set: { ...hostel, isActive: true } },
        { upsert: true, returnDocument: 'after' }
      );
      if (result.createdAt?.getTime() === result.updatedAt?.getTime()) {
        inserted++;
      } else {
        updated++;
      }
    }

    // Count after seeding
    const total = await Hostel.countDocuments({ isActive: true });
    console.log(`\n🏠 Hostel seeding complete:`);
    console.log(`   Upserted : ${HOSTELS.length} hostels`);
    console.log(`   Active in DB: ${total}`);
    HOSTELS.forEach(h => console.log(`   ✓ ${h.name} (${h.type})`));

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

seed();
