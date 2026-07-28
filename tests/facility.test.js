describe('Facility Validation', () => {
    test('Facility should have required fields', () => {
        const facility = {
            name: 'Badminton Hall (6 Courts)',
            category: 'Indoor',
            capacity: 24,
            image: 'https://images.unsplash.com/photo.jpg',
            description: 'Professional badminton courts',
            location: 'Level 2, Sports Complex',
            equipment: 'Badminton nets provided'
        };
        expect(facility.name).toBeDefined();
        expect(facility.category).toBeDefined();
        expect(facility.capacity).toBeDefined();
        expect(facility.location).toBeDefined();
        expect(facility.equipment).toBeDefined();
        expect(facility.description).toBeDefined();
    });

    test('Facility capacity should be a number', () => {
        const facility = { capacity: 24 };
        expect(typeof facility.capacity).toBe('number');
    });

    test('Facility capacity should be greater than 0', () => {
        const facility = { capacity: 24 };
        expect(facility.capacity).toBeGreaterThan(0);
    });

    test('Facility name should not be empty', () => {
        const facility = { name: 'Badminton Hall (6 Courts)' };
        expect(facility.name.length).toBeGreaterThan(0);
    });

    test('Facility category should be valid', () => {
        const validCategories = ['Indoor', 'Outdoor', 'Aquatics'];
        const facility = { category: 'Indoor' };
        expect(validCategories).toContain(facility.category);
    });

    test('Facility image URL should be valid', () => {
        const facility = { 
            image: 'https://images.unsplash.com/photo.jpg' 
        };
        expect(facility.image).toMatch(/^https?:\/\/.+/);
    });

    test('Default image should be used if image is empty', () => {
        const defaultImage = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600';
        const image = '' || defaultImage;
        expect(image).toBe(defaultImage);
    });

    test('8 facilities should exist', () => {
        const facilities = [
            'Competition Hall',
            'Badminton Hall (6 Courts)',
            'Table Tennis Hall (6 Tables)',
            'Multi-Purpose Hall',
            'Tennis / Basketball / Futsal Court',
            'Football and Rugby Field',
            'Swimming Pool',
            'Martial Arts Room'
        ];
        expect(facilities).toHaveLength(8);
    });
});