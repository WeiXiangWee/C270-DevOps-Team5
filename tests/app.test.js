// Import function to generate available booking slots for a selected date
const { getSlotsForDate } = require('../app');


// Public holidays where no booking slots should be generated
const publicHolidays = [
    '2026-01-01', '2026-01-29', '2026-01-30',
    '2026-04-03', '2026-05-01', '2026-05-12',
    '2026-06-02', '2026-08-09', '2026-08-10',
    '2026-10-27', '2026-12-25'
];


// Mock facility data used to test slot generation
const mockFacilities = [
    { name: 'Badminton Hall (6 Courts)', category: 'Indoor' },
    { name: 'Swimming Pool', category: 'Aquatics' }
];


// Test cases for verifying getSlotsForDate function behaviour
describe('getSlotsForDate', () => {

    // Verify that Sundays do not generate any booking slots
    test('Sunday should return no slots', () => {
        const slots = getSlotsForDate('2026-07-26', mockFacilities);
        expect(slots).toHaveLength(0);
    });


    // Verify that public holidays do not generate any booking slots
    test('Public holiday should return no slots', () => {
        const slots = getSlotsForDate('2026-01-01', mockFacilities);
        expect(slots).toHaveLength(0);
    });


    // Verify weekday slot generation
    // Expected: 7 slots per facility (2 facilities x 7 slots = 14 slots)
    test('Weekday should return 7 slots per facility', () => {
        const slots = getSlotsForDate('2026-07-27', mockFacilities);
        expect(slots).toHaveLength(14);
    });


    // Verify Saturday has shorter operating hours
    // Expected: 3 slots per facility (2 facilities x 3 slots = 6 slots)
    test('Saturday should return 3 slots per facility', () => {
        const slots = getSlotsForDate('2026-07-25', mockFacilities);
        expect(slots).toHaveLength(6);
    });


    // Verify that each generated slot contains required booking information
    test('Slot should have correct properties', () => {
        const slots = getSlotsForDate('2026-07-27', mockFacilities);

        expect(slots[0]).toHaveProperty('facility');
        expect(slots[0]).toHaveProperty('date');
        expect(slots[0]).toHaveProperty('time');
        expect(slots[0]).toHaveProperty('status');
    });


    // Verify that newly generated slots are available by default
    test('Slot status should be available by default', () => {
        const slots = getSlotsForDate('2026-07-27', mockFacilities);

        expect(slots[0].status).toBe('available');
    });

});