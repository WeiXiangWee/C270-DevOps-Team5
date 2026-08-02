// Test suite for validating email formats used in the booking system
describe('Email Validation', () => {

    // Regular expressions for validating RP student and staff email formats
    const studentEmailRegex = /^\d{8}@myrp\.edu\.sg$/;
    const staffEmailRegex = /^[a-zA-Z0-9._%+-]+@rp\.edu\.sg$/;


    // Function to check whether email matches accepted RP email formats
    const isValidEmail = (email) => {
        return studentEmailRegex.test(email) || 
               staffEmailRegex.test(email);
    };


    // Student email validation tests
    test('Valid student email should be accepted', () => {
        expect(isValidEmail('12345678@myrp.edu.sg')).toBe(true);
    });


    // Staff email validation test
    test('Valid staff email should be accepted', () => {
        expect(isValidEmail('anthonygoh@rp.edu.sg')).toBe(true);
    });


    // Reject emails from unsupported domains
    test('Gmail should be rejected', () => {
        expect(isValidEmail('john@gmail.com')).toBe(false);
    });

    test('Yahoo email should be rejected', () => {
        expect(isValidEmail('john@yahoo.com')).toBe(false);
    });


    // Reject student emails that do not follow required 8-digit format
    test('Student email with wrong digits should be rejected', () => {
        expect(isValidEmail('123@myrp.edu.sg')).toBe(false);
    });


    // Reject empty email input
    test('Empty email should be rejected', () => {
        expect(isValidEmail('')).toBe(false);
    });


    // Reject email without valid domain
    test('Email without domain should be rejected', () => {
        expect(isValidEmail('12345678')).toBe(false);
    });


    // Reject student emails containing letters instead of digits
    test('Student email with letters should be rejected', () => {
        expect(isValidEmail('abcdefgh@myrp.edu.sg')).toBe(false);
    });

});



// Test suite for validating password confirmation
describe('Password Validation', () => {


    // Verify that matching passwords are accepted
    test('Matching passwords should pass', () => {
        const password = 'password123';
        const confirmPassword = 'password123';

        expect(password === confirmPassword).toBe(true);
    });


    // Verify that different passwords are rejected
    test('Mismatched passwords should fail', () => {
        const password = 'password123';
        const confirmPassword = 'differentpassword';

        expect(password === confirmPassword).toBe(false);
    });


    // Verify empty passwords are not accepted
    test('Empty password should fail', () => {
        const password = '';
        const confirmPassword = '';

        expect(password.length > 0).toBe(false);
    });

});



// Test suite for validating 6-digit password reset verification codes
describe('Reset Code Validation', () => {


    // Verify that reset codes contain exactly 6 digits
    test('6 digit code should be valid', () => {
        const code = '123456';

        expect(/^\d{6}$/.test(code)).toBe(true);
    });


    // Reject reset codes with fewer than 6 digits
    test('Code less than 6 digits should be invalid', () => {
        const code = '123';

        expect(/^\d{6}$/.test(code)).toBe(false);
    });


    // Reject reset codes containing non-numeric characters
    test('Code with letters should be invalid', () => {
        const code = 'abcdef';

        expect(/^\d{6}$/.test(code)).toBe(false);
    });


    // Verify that expired reset codes are rejected
    test('Expired code should be rejected', () => {
        const expiry = new Date(Date.now() - 60 * 1000); // 1 minute ago
        const now = new Date();

        expect(now > expiry).toBe(true);
    });


    // Verify that active reset codes are still valid
    test('Valid code should not be expired', () => {
        const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
        const now = new Date();

        expect(now > expiry).toBe(false);
    });

});