const { getSlotsForDate } = require('../app');

const publicHolidays = [
    '2026-01-01', '2026-01-29', '2026-01-30',
    '2026-04-03', '2026-05-01', '2026-05-12',
    '2026-06-02', '2026-08-09', '2026-08-10',
    '2026-10-27', '2026-12-25'
];

const mockFacilities = [
    { name: 'Badminton Hall (6 Courts)', category: 'Indoor' },
    { name: 'Swimming Pool', category: 'Aquatics' }
];

describe('getSlotsForDate', () => {
    test('Sunday should return no slots', () => {
        const slots = getSlotsForDate('2026-07-26', mockFacilities);
        expect(slots).toHaveLength(0);
    });

    test('Public holiday should return no slots', () => {
        const slots = getSlotsForDate('2026-01-01', mockFacilities);
        expect(slots).toHaveLength(0);
    });

    test('Weekday should return 7 slots per facility', () => {
        const slots = getSlotsForDate('2026-07-27', mockFacilities);
        expect(slots).toHaveLength(14); // 2 facilities x 7 slots
    });

    test('Saturday should return 3 slots per facility', () => {
        const slots = getSlotsForDate('2026-07-25', mockFacilities);
        expect(slots).toHaveLength(6); // 2 facilities x 3 slots
    });

    test('Slot should have correct properties', () => {
        const slots = getSlotsForDate('2026-07-27', mockFacilities);
        expect(slots[0]).toHaveProperty('facility');
        expect(slots[0]).toHaveProperty('date');
        expect(slots[0]).toHaveProperty('time');
        expect(slots[0]).toHaveProperty('status');
    });

    test('Slot status should be available by default', () => {
        const slots = getSlotsForDate('2026-07-27', mockFacilities);
        expect(slots[0].status).toBe('available');
    });
});