const expect = require('chai').expect;
const db = require('../Objects/Database');
const Trip = require('../Objects/Trip');

describe('Object classes', function () {
    const testTripTitle = 'Test Trips';
    let exampleID = null;
    this.timeout(6000);
    after (async () => {

    });

    describe('Trip object', () => {
        it('should be able to create', async () => {
            let testTrip = new Trip();
            testTrip.setProperties({ title: testTripTitle });
            const newID = await testTrip.save();
            exampleID = newID;
            expect(newID).to.exist;
        });

        it('should be able to load with an id', async () => {
            let emptyTrip = new Trip();
            expect(emptyTrip.title).to.be.equal('');
            let existingTrip = new Trip(exampleID);
            await existingTrip.load();
            expect(existingTrip.title).to.equal(testTripTitle);
        });

        it('should be able to update without creating a new one', async () => {
            const updatedName = 'KAZUMAAAA';
            let updateTrip = new Trip(exampleID);
            updateTrip.setProperties({ title: updatedName });
            await updateTrip.save();
            let updatedTrip = new Trip(exampleID);
            await updatedTrip.load();
            expect(updatedTrip.title).to.equal(updatedName);
            updateTrip.setProperties({ title: testTripTitle });
            await updateTrip.save();
        });

        it('should be able to query multiple trips', async () => {
            const numToMake = 5;
            for (let i = 0; i < numToMake; i++) {
                let testTrip = new Trip();
                testTrip.setProperties({ title: testTripTitle });
                exampleID = await testTrip.save();
            }

            let tripList = await Trip.loadTrips();
            expect(tripList.length).to.be.greaterThan(numToMake - 1);
        });

        it('should be able to remove by id', async () => {
            let removeMe = new Trip(exampleID);
            await removeMe.delete();
            let tripList = await Trip.loadTrips();
            const matchedTrips = tripList.filter(trip => trip.id === exampleID);
            expect(matchedTrips.length).to.equal(0);
        });
    });
});