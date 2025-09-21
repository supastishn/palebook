const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;
let token, userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test-secret';
  const serverModule = require('../server');
  app = serverModule.app;

  const res = await request(app).post('/api/auth/register').send({
    firstName: 'User', lastName: 'Profile', email: 'user@test.com', password: 'pw123456'
  });
  token = res.body.token;
  userId = res.body.user.id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Users API', () => {
  it('gets own profile with token', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', 'user@test.com');
  });

  it('updates profile', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'New bio!' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('bio', 'New bio!');
  });

  it('updates privacy settings', async () => {
    const res = await request(app)
      .put('/api/users/privacy')
      .set('Authorization', `Bearer ${token}`)
      .send({ profile: 'private', posts: 'private' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('profile', 'private');
    expect(res.body).toHaveProperty('posts', 'private');
  });

  it('searches for users', async () => {
    const res = await request(app)
      .get('/api/users/search/user')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});