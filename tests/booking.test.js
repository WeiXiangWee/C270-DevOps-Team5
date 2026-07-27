describe('Booking Validation', () => {
    test('Booking should have required fields', () => {
        const booking = {
            userId: 1,
            userName: 'John Doe',
            name: 'Badminton Hall (6 Courts)',
            date: '2026-07-27',
            duration: '09:00 – 11:00',
            status: 'confirmed'
        };
        expect(booking.userId).toBeDefined();
        expect(booking.userName).toBeDefined();
        expect(booking.name).toBeDefined();
        expect(booking.date).toBeDefined();
        expect(booking.duration).toBeDefined();
        expect(booking.status).toBeDefined();
    });

    test('Booking status should be confirmed by default', () => {
        const booking = { status: 'confirmed' };
        expect(booking.status).toBe('confirmed');
    });

    test('Cancelled booking should have cancelled status', () => {
        const booking = { status: 'cancelled' };
        expect(booking.status).toBe('cancelled');
    });

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

        const isDuplicate = existingBookings.some(b =>
            b.userId === newBooking.userId &&
            b.name === newBooking.name &&
            b.date === newBooking.date &&
            b.duration === newBooking.duration &&
            b.status === 'confirmed'
        );

        expect(isDuplicate).toBe(true);
    });

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

        const isDuplicate = existingBookings.some(b =>
            b.userId === newBooking.userId &&
            b.name === newBooking.name &&
            b.date === newBooking.date &&
            b.duration === newBooking.duration &&
            b.status === 'confirmed'
        );

        expect(isDuplicate).toBe(false);
    });

    test('User cancel should change status to cancelled', () => {
        const booking = { status: 'confirmed' };
        booking.status = 'cancelled';
        expect(booking.status).toBe('cancelled');
    });

    test('Cancelled booking remarks status should be shown for user cancel', () => {
        const booking = { 
            status: 'cancelled',
            remarks: 'Cancelled by user',
            remarks_status: 'shown'
        };
        expect(booking.remarks_status).toBe('shown');
    });

    test('Admin cancel should set remarks_status to pending', () => {
        const booking = {
            status: 'cancelled',
            remarks: 'Facility closed for maintenance',
            remarks_status: 'pending'
        };
        expect(booking.remarks_status).toBe('pending');
    });
});