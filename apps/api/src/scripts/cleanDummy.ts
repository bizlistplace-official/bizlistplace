import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../modules/users/user.model';
import { Category } from '../modules/categories/category.model';
import { Business } from '../modules/businesses/business.model';
import { BusinessLocation } from '../modules/businesses/businessLocation.model';
import { Review } from '../modules/reviews/review.model';
import { ClaimRequest } from '../modules/claims/claim.model';
import { Report } from '../modules/reports/report.model';

async function cleanDummyData() {
  console.log('🧹 Connecting to MongoDB to clean dummy data...');
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.log('ℹ️ MongoDB is offline. In-memory mock dummy data has already been cleaned in mockData.ts.');
    process.exit(0);
  }

  // 1. Delete all businesses
  const deletedBusinesses = await Business.deleteMany({});
  console.log(`✓ Deleted ${deletedBusinesses.deletedCount} dummy businesses`);

  // 2. Delete all locations
  const deletedLocations = await BusinessLocation.deleteMany({});
  console.log(`✓ Deleted ${deletedLocations.deletedCount} business locations`);

  // 3. Delete all reviews
  const deletedReviews = await Review.deleteMany({});
  console.log(`✓ Deleted ${deletedReviews.deletedCount} reviews`);

  // 4. Delete claims and reports
  const deletedClaims = await ClaimRequest.deleteMany({});
  const deletedReports = await Report.deleteMany({});
  console.log(`✓ Deleted ${deletedClaims.deletedCount} claims and ${deletedReports.deletedCount} reports`);

  // 5. Delete non-admin demo users (keep admin)
  const deletedUsers = await User.deleteMany({ role: { $ne: 'admin' } });
  console.log(`✓ Deleted ${deletedUsers.deletedCount} demo users (Admin account preserved)`);

  // 6. Reset category business counts to 0
  await Category.updateMany({}, { $set: { businessCount: 0 } });
  const categoryCount = await Category.countDocuments();
  console.log(`✓ Preserved all ${categoryCount} primary categories (counts reset to 0)`);

  console.log('\n✨ Database is now clean and ready for real business registrations!');
  await disconnectDB();
  process.exit(0);
}

cleanDummyData().catch((err) => {
  console.error('Clean failed:', err);
  process.exit(1);
});
