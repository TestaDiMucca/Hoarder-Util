const expect = require('chai').expect;
const db = require('../Objects/Database');
const Trip = require('../Objects/Trip');
const TripDay = require('../Objects/TripDay');

describe('Object classes', function () {
    const testTripTitle = 'Test Trips';
    let exampleID = null;
    this.timeout(6000);
    after(async () => {
        const rows = await db.all(`SELECT id FROM ${Trip.dbTable} WHERE title = ?`, [testTripTitle]);
        for (let i = 0; i < rows.length; i++) {
            let trip = new Trip(rows[i].id);
            await trip.delete();
        }
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

    describe('TripDay object', () => {
        let newTrip;
        let newTripID;
        before(async () => {
            let testTrip = new Trip();
            testTrip.setProperties({ title: testTripTitle });
            const newID = await testTrip.save();
            testTrip.id = newID;
            newTrip = testTrip;
            newTripID = newID;
        });

        const day1 = '2004-12-04';
        const day2 = '2010-02-10';

        it ('should be able to add a day to an event', async () => {
            let newDay = new TripDay();
            newDay.setProperties({
                date: day1,
                description: 'did some test tings dis day.',
                tripID: newTripID
            });
            let id = await newDay.save();
            expect(id).to.exist;
        });

        it('should be able to load in when loading a trip', async () => {
            await newTrip.load();
            expect(newTrip.days.length).to.be.greaterThan(0);
        });

        it ('should set start and end date with multiple days', async () => {
            let newDay = new TripDay();
            newDay.setProperties({
                date: day2,
                description: 'did some test tings dis day agen.',
                tripID: newTripID
            });
            await newDay.save();
            await newTrip.load();
            expect(newTrip.startDate).to.equal(day1);
            expect(newTrip.endDate).to.equal(day2);
        });
    });
});