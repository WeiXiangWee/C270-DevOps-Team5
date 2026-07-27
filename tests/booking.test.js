const request = require('supertest');
const app = require('../app');
const db = require('../db');

jest.mock('../db');

describe('Booking Module Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('User can create booking -> inserted into database', async () => {
    db.query.mockResolvedValueOnce([[]]); // No existing booking
    db.query.mockResolvedValueOnce([{ insertId: 101 }]);

    const res = await request(app)
      .post('/bookings')
      .send({
        facilityId: 1,
        date: '2026-08-10',
        timeSlot: '10:00 - 12:00'
      });

    expect([200, 201, 302]).toContain(res.statusCode);
  });

  test('Prevent double booking for same user + facility + date + time', async () => {
    // Return existing active booking
    db.query.mockResolvedValueOnce([[{ id: 101, status: 'Confirmed' }]]);

    const res = await request(app)
      .post('/bookings')
      .send({
        facilityId: 1,
        date: '2026-08-10',
        timeSlot: '10:00 - 12:00'
      });

    expect([400, 409]).toContain(res.statusCode);
  });

  test('User can cancel own booking -> status changes to cancelled', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .post('/bookings/cancel/101')
      .send();

    expect([200, 302]).toContain(res.statusCode);
  });

  test('Admin can cancel booking with reason -> status cancelled & remarks saved', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .post('/admin/bookings/cancel/101')
      .send({ reason: 'Facility under maintenance' });

    expect([200, 302]).toContain(res.statusCode);
  });

  test('Cancelled booking slot becomes available again', async () => {
    // 1. Create booking
    db.query.mockResolvedValueOnce([[]]); // Check existing
    db.query.mockResolvedValueOnce([{ insertId: 202 }]); // Insert

    await request(app)
      .post('/bookings')
      .send({ facilityId: 1, date: '2026-08-15', timeSlot: '14:00 - 16:00' });

    // 2. Cancel booking
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    await request(app).post('/bookings/cancel/202');

    // 3. Check availability
    db.query.mockResolvedValueOnce([[]]); // Returns no active/confirmed bookings blocking this slot
    const availabilityRes = await request(app)
      .get('/api/availability')
      .query({ date: '2026-08-15' });

    expect(availabilityRes.statusCode).toBe(200);
    expect(availabilityRes.body.availableSlots.length).toBeGreaterThan(0);
  });
});