import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../modules/users/user.model';
import { Category } from '../modules/categories/category.model';
import { Business } from '../modules/businesses/business.model';
import { BusinessLocation } from '../modules/businesses/businessLocation.model';
import { Review } from '../modules/reviews/review.model';

describe('Biz List Place API Integration Tests', () => {
  let adminToken: string;
  let ownerToken: string;
  let userToken: string;
  let categoryId: string;
  let businessId: string;
  let businessSlug: string;

  beforeAll(async () => {
    process.env.USE_MEMORY_DB = 'true';
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({});
      await Category.deleteMany({});
      await Business.deleteMany({});
      await BusinessLocation.deleteMany({});
      await Review.deleteMany({});
    }
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('1. Health check reports status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.app).toBe('Biz List Place API');
  });

  it('2. User Registration & Password Hashing', async () => {
    // Register Admin
    const adminRes = await request(app).post('/api/v1/auth/register').send({
      name: 'System Admin',
      email: 'admin@test.com',
      password: 'AdminPassword123!',
      role: 'business_owner',
    });
    expect(adminRes.status).toBe(201);
    expect(adminRes.body.data.user.email).toBe('admin@test.com');
    expect(adminRes.body.data.user.passwordHash).toBeUndefined(); // Private field never exposed!

    // Upgrade directly in db for test
    if (mongoose.connection.readyState === 1) {
      await User.findByIdAndUpdate(adminRes.body.data.user._id, { role: 'admin' });
    }
    adminToken = adminRes.body.data.token;

    // Register Owner
    const ownerRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Business Owner',
      email: 'owner@test.com',
      password: 'OwnerPassword123!',
      role: 'business_owner',
    });
    expect(ownerRes.status).toBe(201);
    ownerToken = ownerRes.body.data.token;

    // Register Regular User
    const userRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Regular Customer',
      email: 'consumer@test.com',
      password: 'UserPassword123!',
      role: 'user',
    });
    expect(userRes.status).toBe(201);
    userToken = userRes.body.data.token;
  });

  it('3. Authentication: Login and session retrieval', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'owner@test.com',
      password: 'OwnerPassword123!',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();

    // Verify /auth/me
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe('owner@test.com');
  });

  it('4. Categories: Admin creation and public retrieval', async () => {
    const catRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Industrial Engineering',
        slug: 'industrial-engineering',
        description: 'Heavy machinery and industrial automation specialists',
        icon: 'Factory',
      });
    expect(catRes.status).toBe(201);
    categoryId = catRes.body.data._id;

    // Public category listing
    const listRes = await request(app).get('/api/v1/categories');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((c: any) => c.slug === 'industrial-engineering')).toBe(true);
  });

  it('5. Listing Lifecycle: Submission enters pending state', async () => {
    const bizRes = await request(app)
      .post('/api/v1/businesses')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Titan Industrial Automation',
        description:
          'High precision robotic welding and industrial automation systems for manufacturing plants worldwide.',
        shortDescription: 'Industrial automation & robotic welding systems.',
        categoryIds: [categoryId],
        businessType: 'physical',
        contactEmail: 'contact@titan-automation.test',
        phone: '+1 555-0182',
        primaryLocation: {
          branchName: 'Headquarters',
          countryCode: 'US',
          region: 'Michigan',
          city: 'Detroit',
          addressLine1: '1200 Woodward Avenue',
        },
      });

    expect(bizRes.status).toBe(201);
    expect(bizRes.body.data.business.listingStatus).toBe('pending');
    businessId = bizRes.body.data.business._id;
    businessSlug = bizRes.body.data.business.slug;
  });

  it('6. Moderation & Public Boundary: Pending listing not in public search', async () => {
    // Anonymous search should NOT return pending listing
    const searchRes = await request(app).get('/api/v1/businesses?q=Titan');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.some((b: any) => b._id === businessId)).toBe(false);

    // Unauthenticated GET by slug should return 404
    const slugRes = await request(app).get(`/api/v1/businesses/${businessSlug}`);
    expect(slugRes.status).toBe(404);
  });

  it('7. Admin Approval: Admin approves pending listing', async () => {
    const approveRes = await request(app)
      .patch(`/api/v1/admin/businesses/${businessId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.listingStatus).toBe('published');

    // Now it MUST appear in public search and getBySlug
    const searchRes = await request(app).get('/api/v1/businesses?q=Titan');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.some((b: any) => b._id === businessId)).toBe(true);

    const slugRes = await request(app).get(`/api/v1/businesses/${businessSlug}`);
    expect(slugRes.status).toBe(200);
    expect(slugRes.body.data.name).toBe('Titan Industrial Automation');
  });

  it('8. Business Slug Uniqueness: Duplicate names receive hyphenated suffix', async () => {
    const dupRes = await request(app)
      .post('/api/v1/businesses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Titan Industrial Automation',
        description: 'Second company with identical name submitted to test slug collision handling.',
        categoryIds: [categoryId],
      });
    expect(dupRes.status).toBe(201);
    expect(dupRes.body.data.business.slug).toMatch(/^titan-industrial-automation-\d+$/);
  });

  it('9. Ownership Authorization: Unauthorized user cannot edit another business', async () => {
    const unauthorizedRes = await request(app)
      .patch(`/api/v1/businesses/${businessId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Hacked Business Name',
      });
    expect(unauthorizedRes.status).toBe(403);
  });

  it('10. Reviews: Creation and Duplicate Review Policy Enforcement', async () => {
    // 1st review should succeed
    const revRes = await request(app)
      .post(`/api/v1/businesses/${businessId}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        rating: 5,
        title: 'Outstanding industrial quality',
        content: 'Exceptional engineering standards and prompt delivery. Highly recommended partner.',
      });
    expect(revRes.status).toBe(201);

    // 2nd review from SAME user on SAME business must be rejected!
    const dupRevRes = await request(app)
      .post(`/api/v1/businesses/${businessId}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        rating: 4,
        title: 'Second review attempt',
        content: 'This duplicate review should be prevented by product policy.',
      });
    expect(dupRevRes.status).toBe(400);
    expect(dupRevRes.body.message).toContain('already submitted a review');
  });
});
