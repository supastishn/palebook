const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'test-secret';

  // Lazy require server after setting env
  const serverModule = require('../server');
  app = serverModule.app;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth API', () => {
  it('registers a new user and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('prevents duplicate registration', async () => {
    await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'dup@example.com',
      password: 'password123'
    });

    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'dup@example.com',
      password: 'password123'
    });

    expect(res.statusCode).toBe(400);
  });

  it('logs in a user with valid credentials', async () => {
    await request(app).post('/api/auth/register').send({
      firstName: 'Login',
      lastName: 'User',
      email: 'login@example.com',
      password: 'password123'
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('login@example.com');
  });
});