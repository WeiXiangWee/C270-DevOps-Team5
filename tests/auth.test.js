const request = require('supertest');
const app = require('../app');
const db = require('../db');

jest.mock('../db');

describe('Authentication Module Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    test('Register with valid RP student email -> succeeds', async () => {
      db.query.mockResolvedValueOnce([[]]); // No duplicate email
      db.query.mockResolvedValueOnce([{ insertId: 1 }]); // Successful insert

      const res = await request(app)
        .post('/register')
        .send({
          email: '12345678@myrp.edu.sg',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      expect(res.statusCode).not.toBe(400);
      expect(res.headers.location || res.text).toMatch(/login|success/i);
    });

    test('Register with valid RP staff email -> succeeds', async () => {
      db.query.mockResolvedValueOnce([[]]);
      db.query.mockResolvedValueOnce([{ insertId: 2 }]);

      const res = await request(app)
        .post('/register')
        .send({
          email: 'name@rp.edu.sg',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      expect(res.statusCode).not.toBe(400);
    });

    test('Register with invalid email domain -> rejected', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'john@gmail.com',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      expect([400, 422]).toContain(res.statusCode);
    });

    test('Register with duplicate email -> rejected', async () => {
      db.query.mockResolvedValueOnce([[{ id: 1, email: '12345678@myrp.edu.sg' }]]);

      const res = await request(app)
        .post('/register')
        .send({
          email: '12345678@myrp.edu.sg',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      expect([400, 409]).toContain(res.statusCode);
    });

    test('Register with mismatched passwords -> rejected', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: '12345678@myrp.edu.sg',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword!'
        });

      expect([400, 422]).toContain(res.statusCode);
    });
  });

  describe('POST /login', () => {
    test('Login with correct email and password -> succeeds', async () => {
      // Mock db returning hashed user matching bcrypt
      db.query.mockResolvedValueOnce([[{
        id: 1,
        email: '12345678@myrp.edu.sg',
        password: '$2b$10$e8rXpG3B7XG8m5D4xW89u.K/ZqM9BvVzQ1c1W3X1V1V1V1V1V1V1V' // hashed password
      }]]);

      const res = await request(app)
        .post('/login')
        .send({
          email: '12345678@myrp.edu.sg',
          password: 'Password123!'
        });

      expect([200, 302]).toContain(res.statusCode);
    });

    test('Login with wrong password -> rejected', async () => {
      db.query.mockResolvedValueOnce([[{
        id: 1,
        email: '12345678@myrp.edu.sg',
        password: 'hashed_password'
      }]]);

      const res = await request(app)
        .post('/login')
        .send({
          email: '12345678@myrp.edu.sg',
          password: 'WrongPassword'
        });

      expect([400, 401]).toContain(res.statusCode);
    });

    test('Login with unregistered email -> rejected', async () => {
      db.query.mockResolvedValueOnce([[]]); // No user found

      const res = await request(app)
        .post('/login')
        .send({
          email: 'unregistered@myrp.edu.sg',
          password: 'Password123!'
        });

      expect([400, 401, 404]).toContain(res.statusCode);
    });
  });

  describe('Forgot Password Flow', () => {
    test('Request forgot password with valid email -> code generated', async () => {
      db.query.mockResolvedValueOnce([[{ id: 1, email: '12345678@myrp.edu.sg' }]]);
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // save reset code

      const res = await request(app)
        .post('/forgot-password')
        .send({ email: '12345678@myrp.edu.sg' });

      expect([200, 302]).toContain(res.statusCode);
    });

    test('Request forgot password with invalid email -> rejected', async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .post('/forgot-password')
        .send({ email: 'nonexistent@myrp.edu.sg' });

      expect([400, 404]).toContain(res.statusCode);
    });

    test('Verify correct reset code -> succeeds', async () => {
      db.query.mockResolvedValueOnce([[{
        id: 1,
        reset_code: '123456',
        code_expires: Date.now() + 100000
      }]]);

      const res = await request(app)
        .post('/verify-reset-code')
        .send({ email: '12345678@myrp.edu.sg', code: '123456' });

      expect([200, 302]).toContain(res.statusCode);
    });

    test('Verify wrong reset code -> rejected', async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .post('/verify-reset-code')
        .send({ email: '12345678@myrp.edu.sg', code: '000000' });

      expect([400, 401]).toContain(res.statusCode);
    });

    test('Verify expired reset code -> rejected', async () => {
      db.query.mockResolvedValueOnce([[{
        id: 1,
        reset_code: '123456',
        code_expires: Date.now() - 100000 // Expired
      }]]);

      const res = await request(app)
        .post('/verify-reset-code')
        .send({ email: '12345678@myrp.edu.sg', code: '123456' });

      expect([400, 401]).toContain(res.statusCode);
    });
  });

  describe('Reset Password', () => {
    test('Matching password and confirm password -> updated', async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .post('/reset-password')
        .send({
          email: '12345678@myrp.edu.sg',
          password: 'NewPassword123!',
          confirmPassword: 'NewPassword123!'
        });

      expect([200, 302]).toContain(res.statusCode);
    });

    test('Mismatched password and confirm password -> rejected', async () => {
      const res = await request(app)
        .post('/reset-password')
        .send({
          email: '12345678@myrp.edu.sg',
          password: 'NewPassword123!',
          confirmPassword: 'WrongMismatch!'
        });

      expect([400, 422]).toContain(res.statusCode);
    });
  });
});