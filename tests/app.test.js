const request = require('supertest');
const app = require('../app');
const db = require('../db');

jest.mock('../db');

describe('Availability Logic Tests (app.js)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Sunday should return no available slots', async () => {
    // 2026-07-26 is a Sunday
    const res = await request(app)
      .get('/api/availability')
      .query({ date: '2026-07-26' });

    expect(res.statusCode).toBe(200);
    expect(res.body.availableSlots).toEqual([]);
  });

  test('Public holiday should return no available slots', async () => {
    // 2026-01-01 is New Year's Day
    const res = await request(app)
      .get('/api/availability')
      .query({ date: '2026-01-01' });

    expect(res.statusCode).toBe(200);
    expect(res.body.availableSlots).toEqual([]);
  });

  test('Weekday should generate 7 time slots per facility', async () => {
    // 2026-07-27 is a Monday
    db.query.mockResolvedValueOnce([
      [{ id: 1, name: 'Competition Hall' }]
    ]);

    const res = await request(app)
      .get('/api/availability')
      .query({ date: '2026-07-27' });

    expect(res.statusCode).toBe(200);
    expect(res.body.availableSlots.length).toBe(7);
  });

  test('Saturday should generate 3 time slots per facility', async () => {
    // 2026-07-25 is a Saturday
    db.query.mockResolvedValueOnce([
      [{ id: 1, name: 'Competition Hall' }]
    ]);

    const res = await request(app)
      .get('/api/availability')
      .query({ date: '2026-07-25' });

    expect(res.statusCode).toBe(200);
    expect(res.body.availableSlots.length).toBe(3);
  });

  test('Facilities should load dynamically from database', async () => {
    // Mock 2 facilities returning on a Monday (7 slots each = 14 total)
    db.query.mockResolvedValueOnce([
      [
        { id: 1, name: 'Competition Hall' },
        { id: 2, name: 'Badminton Hall' }
      ]
    ]);

    const res = await request(app)
      .get('/api/availability')
      .query({ date: '2026-07-27' });

    expect(res.statusCode).toBe(200);
    expect(res.body.availableSlots.length).toBe(14);
  });
});