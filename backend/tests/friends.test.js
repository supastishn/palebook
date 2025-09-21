const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;
let token1, token2, userId1, userId2;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test-secret';
  const serverModule = require('../server');
  app = serverModule.app;

  const res1 = await request(app).post('/api/auth/register').send({
    firstName: 'A', lastName: 'A', email: 'a@test.com', password: 'pw123456'
  });
  token1 = res1.body.token;
  userId1 = res1.body.user.id;
  const res2 = await request(app).post('/api/auth/register').send({
    firstName: 'B', lastName: 'B', email: 'b@test.com', password: 'pw123456'
  });
  token2 = res2.body.token;
  userId2 = res2.body.user.id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Friends API', () => {
  it('send friend request', async () => {
    const res = await request(app)
      .post('/api/friends/request')
      .set('Authorization', `Bearer ${token1}`)
      .send({ recipientId: userId2 });
    expect(res.statusCode).toBe(200);
  });

  it('get friend requests', async () => {
    const res = await request(app)
      .get('/api/friends/requests')
      .set('Authorization', `Bearer ${token2}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('accept friend request', async () => {
    const res = await request(app)
      .post('/api/friends/accept')
      .set('Authorization', `Bearer ${token2}`)
      .send({ requesterId: userId1 });
    expect(res.statusCode).toBe(200);
  });

  it('list friends', async () => {
    const res = await request(app)
      .get('/api/friends')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('remove friend', async () => {
    const res = await request(app)
      .delete(`/api/friends/${userId2}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toBe(200);
  });
});