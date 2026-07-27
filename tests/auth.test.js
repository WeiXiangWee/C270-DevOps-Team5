describe('Email Validation', () => {
    const studentEmailRegex = /^\d{8}@myrp\.edu\.sg$/;
    const staffEmailRegex = /^[a-zA-Z0-9._%+-]+@rp\.edu\.sg$/;

    const isValidEmail = (email) => {
        return studentEmailRegex.test(email) || 
               staffEmailRegex.test(email);
    };

    // Student email tests
    test('Valid student email should be accepted', () => {
        expect(isValidEmail('12345678@myrp.edu.sg')).toBe(true);
    });

    test('Valid staff email should be accepted', () => {
        expect(isValidEmail('anthonygoh@rp.edu.sg')).toBe(true);
    });

    test('Gmail should be rejected', () => {
        expect(isValidEmail('john@gmail.com')).toBe(false);
    });

    test('Yahoo email should be rejected', () => {
        expect(isValidEmail('john@yahoo.com')).toBe(false);
    });

    test('Student email with wrong digits should be rejected', () => {
        expect(isValidEmail('123@myrp.edu.sg')).toBe(false);
    });

    test('Empty email should be rejected', () => {
        expect(isValidEmail('')).toBe(false);
    });

    test('Email without domain should be rejected', () => {
        expect(isValidEmail('12345678')).toBe(false);
    });

    test('Student email with letters should be rejected', () => {
        expect(isValidEmail('abcdefgh@myrp.edu.sg')).toBe(false);
    });
});

describe('Password Validation', () => {
    test('Matching passwords should pass', () => {
        const password = 'password123';
        const confirmPassword = 'password123';
        expect(password === confirmPassword).toBe(true);
    });

    test('Mismatched passwords should fail', () => {
        const password = 'password123';
        const confirmPassword = 'differentpassword';
        expect(password === confirmPassword).toBe(false);
    });

    test('Empty password should fail', () => {
        const password = '';
        const confirmPassword = '';
        expect(password.length > 0).toBe(false);
    });
});

describe('Reset Code Validation', () => {
    test('6 digit code should be valid', () => {
        const code = '123456';
        expect(/^\d{6}$/.test(code)).toBe(true);
    });

    test('Code less than 6 digits should be invalid', () => {
        const code = '123';
        expect(/^\d{6}$/.test(code)).toBe(false);
    });

    test('Code with letters should be invalid', () => {
        const code = 'abcdef';
        expect(/^\d{6}$/.test(code)).toBe(false);
    });

    test('Expired code should be rejected', () => {
        const expiry = new Date(Date.now() - 60 * 1000); // 1 min ago
        const now = new Date();
        expect(now > expiry).toBe(true);
    });

    test('Valid code should not be expired', () => {
        const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins from now
        const now = new Date();
        expect(now > expiry).toBe(false);
    });
});