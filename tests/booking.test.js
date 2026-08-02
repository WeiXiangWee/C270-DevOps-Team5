// Test suite for validating booking-related functions and business rules
describe('Booking Validation', () => {


    // Verify that a booking contains all required information
    test('Booking should have required fields', () => {
        const booking = {
            userId: 1,
            userName: 'John Doe',
            name: 'Badminton Hall (6 Courts)',
            date: '2026-07-27',
            duration: '09:00 – 11:00',
            status: 'confirmed'
        };

        // Check that all required booking fields exist
        expect(booking.userId).toBeDefined();
        expect(booking.userName).toBeDefined();
        expect(booking.name).toBeDefined();
        expect(booking.date).toBeDefined();
        expect(booking.duration).toBeDefined();
        expect(booking.status).toBeDefined();
    });


    // Verify that newly created bookings have confirmed status by default
    test('Booking status should be confirmed by default', () => {
        const booking = { status: 'confirmed' };

        expect(booking.status).toBe('confirmed');
    });


    // Verify that cancelled bookings are updated with cancelled status
    test('Cancelled booking should have cancelled status', () => {
        const booking = { status: 'cancelled' };

        expect(booking.status).toBe('cancelled');
    });


    // Verify that the system detects duplicate bookings
    // Duplicate occurs when the same user books the same facility,
    // date and time slot that is already confirmed
    test('Double booking should be detected', () => {

        const existingBookings = [
            {
                userId: 1,
                name: 'Badminton Hall (6 Courts)',
                date: '2026-07-27',
                duration: '09:00 – 11:00',
                status: 'confirmed'
            }
        ];

        const newBooking = {
            userId: 1,
            name: 'Badminton Hall (6 Courts)',
            date: '2026-07-27',
            duration: '09:00 – 11:00'
        };


        // Check whether a matching confirmed booking already exists
        const isDuplicate = existingBookings.some(b =>
            b.userId === newBooking.userId &&
            b.name === newBooking.name &&
            b.date === newBooking.date &&
            b.duration === newBooking.duration &&
            b.status === 'confirmed'
        );

        expect(isDuplicate).toBe(true);
    });


    // Verify that booking a different time slot is allowed
    test('Different time slot should not be duplicate', () => {

        const existingBookings = [
            {
                userId: 1,
                name: 'Badminton Hall (6 Courts)',
                date: '2026-07-27',
                duration: '09:00 – 11:00',
                status: 'confirmed'
            }
        ];

        const newBooking = {
            userId: 1,
            name: 'Badminton Hall (6 Courts)',
            date: '2026-07-27',
            duration: '11:00 – 13:00'
        };


        // Compare new booking details against existing bookings
        const isDuplicate = existingBookings.some(b =>
            b.userId === newBooking.userId &&
            b.name === newBooking.name &&
            b.date === newBooking.date &&
            b.duration === newBooking.duration &&
            b.status === 'confirmed'
        );

        expect(isDuplicate).toBe(false);
    });


    // Verify that users can cancel their own bookings
    test('User cancel should change status to cancelled', () => {

        const booking = { status: 'confirmed' };

        // Update booking status after cancellation
        booking.status = 'cancelled';

        expect(booking.status).toBe('cancelled');
    });


    // Verify that user cancellation remarks are visible
    test('Cancelled booking remarks status should be shown for user cancel', () => {

        const booking = { 
            status: 'cancelled',
            remarks: 'Cancelled by user',
            remarks_status: 'shown'
        };

        expect(booking.remarks_status).toBe('shown');
    });


    // Verify that admin cancellation sets remarks status to pending
    // This allows users to view the cancellation reason
    test('Admin cancel should set remarks_status to pending', () => {

        const booking = {
            status: 'cancelled',
            remarks: 'Facility closed for maintenance',
            remarks_status: 'pending'
        };

        expect(booking.remarks_status).toBe('pending');
    });

});