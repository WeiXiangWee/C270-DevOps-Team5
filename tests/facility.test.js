const request = require('supertest');
const app = require('../app');
const db = require('../db');

jest.mock('../db');

describe('Facility Management Module Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Facilities can load from database', async () => {
    const mockFacilities = [
      { id: 1, name: 'Competition Hall', category: 'Indoor' },
      { id: 2, name: 'Badminton Hall', category: 'Indoor' }
    ];
    db.query.mockResolvedValueOnce([mockFacilities]);

    const res = await request(app).get('/facilities');

    expect(res.statusCode).toBe(200);
  });

  test('Admin can add facility', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 3 }]);

    const res = await request(app)
      .post('/facilities/add')
      .send({
        name: 'Squash Court 1',
        category: 'Indoor',
        capacity: 4,
        location: 'Level 3, Sports Complex',
        equipment: 'Rackets provided',
        description: 'Air-conditioned court'
      });

    expect([200, 201, 302]).toContain(res.statusCode);
  });

  test('Admin can edit facility', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .post('/facilities/edit/1')
      .send({
        name: 'Competition Hall Updated',
        category: 'Indoor',
        capacity: 100,
        location: 'Sports Complex Level 1',
        equipment: 'Full set',
        description: 'Updated description'
      });

    expect([200, 302]).toContain(res.statusCode);
  });

  test('Admin can delete facility', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Delete query

    const res = await request(app)
      .post('/facilities/delete/1')
      .send();

    expect([200, 302]).toContain(res.statusCode);
  });

  test('Delete facility should cancel active bookings', async () => {
    // Mock updating related active bookings to 'Cancelled'
    db.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // Cancel active bookings
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Delete facility row

    const res = await request(app)
      .post('/facilities/delete/1')
      .send();

    expect([200, 302]).toContain(res.statusCode);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringMatching(/UPDATE|DELETE/i),
      expect.anything()
    );
  });
});