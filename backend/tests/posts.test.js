const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;
let token;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test-secret';
  const serverModule = require('../server');
  app = serverModule.app;

  const res = await request(app).post('/api/auth/register').send({
    firstName: 'Poster', lastName: 'McGee', email: 'poster@test.com', password: 'pw123456'
  });
  token = res.body.token;
  userId = res.body.user.id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Posts API', () => {
  let postId;

  it('creates a new post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .field('content', 'my first test post');
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('content', 'my first test post');
    postId = res.body._id;
  });

  it('gets feed posts', async () => {
    const res = await request(app)
      .get('/api/posts/feed')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('likes and unlikes a post', async () => {
    const res1 = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);
    expect(res1.statusCode).toBe(200);
    expect(Array.isArray(res1.body.likes)).toBe(true);
    const res2 = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);
    expect(res2.statusCode).toBe(200);
  });

  it('adds comment to a post', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comment`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Nice post!' });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.comments)).toBe(true);
  });

  it('deletes a post', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});