const expect = require('chai').expect;
const db = require('../Objects/Database');
const Trip = require('../Objects/Trip');

//  TODO: Insert database connector
describe('Object classes', function () {
    const testTripTitle = 'Test Trips';
    this.timeout(6000);
    describe('Trip object', () => {
        it('should be able to create', async () => {
            let testTrip = new Trip();
            testTrip.setProperties({ title: testTripTitle });
            const newID = await testTrip.save();
            expect(newID).to.exist;
        });
    }); 
});