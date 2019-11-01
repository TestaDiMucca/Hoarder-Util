const fs = require('fs');
const { promisify } = require('util');

const Trip = require('../Objects/Trip');
const TripDay = require('../Objects/TripDay');

const { TRIPS_JSON } = require('../constants');

const fsp = {
    readFile: promisify(fs.readFile),
    appendFile: promisify(fs.appendFile),
    writeFile: promisify(fs.writeFile)
};
const ENCODING = 'utf8';
/**
 * A day's events
 * @typedef {Object} DayTrip
 * @property {string} date ISO string for the day
 * @property {string} description Description of the day's events
 */

/**
 * A whole trip
 * @typedef {Object} Trip
 * @property {string} title
 * @property {string} startDate in ISO String
 * @property {string} endDate in ISO String
 * @property {DayTrip[]} days
 */


/**
 * Store array of known trips and things just to display
 * Manual for now, as many DSLR photos lack GPS data
 * and not useful enough to spend much time on
 * 
 * Main methods for this can probably be an API base
 */
class TripHandler {
    constructor () {
        /** @type Trip[] */
        this.tripList = [];
    }

    /**
     * 
     * @param {'POST' | 'GET' | 'PUT' | 'DELETE'} method
     * @param {Request} req 
     * @param {Response} res 
     */
    async handleRequest (method, req, res) {
        try {
            const argsString = req.params[0] ? req.params[0] : '';
            const args = argsString.length ? argsString.split('/').slice(1) : [];
            const params = req.body;
            const data = await this[method.toLowerCase()](args, params);
            res.status(200).send(data);
        } catch (e) {
            res.status(500).send('Trip API error: ' + e.message);
        }
    }

    async post (args, params) {
        const arg1 = args ? args[0] : null;
        let trip;
        switch (arg1) {
            case 'days':
                trip = new TripDay();
                trip.setProperties(params);
                await trip.save();
                return trip;
            default:
                trip = new Trip();
                trip.setProperties(params);
                await trip.save();
                return trip;
        }
    }

    async get (args, params) {
        const arg1 = args ? args[0] : null;
        switch (arg1) {
            default:
                if (!arg1) {
                    /* Load all trips */
                    return await Trip.loadTrips();
                } else {
                    /* Load one trip */
                    let data = new Trip(+arg1);
                    await data.load();
                    return data;
                }
                
        }
    }

    async put (args, params) {
        const arg1 = args ? args[0] : null;
        let trip;
        console.log('put', params)
        switch (arg1) {
            case 'days':
                trip = new TripDay(params.id);
                trip.setProperties(params);
                await trip.save();
                return trip;
            default:
                trip = new Trip(params.id);
                trip.setProperties(params);
                await trip.save();
                return trip;
        }
    }

    async delete (args, params) {
        const arg1 = args ? args[0] : null;
        let trip, data;
        switch (arg1) {
            case 'days':
                const arg2 = args ? args[1] : null;
                trip = new TripDay(+arg2);
                data = await trip.delete();
                return data;
                break;
            default:
                trip = new Trip(+arg1);
                data = await trip.delete();
                return data;
        }
    }

    async load () {
        try {
            let json = await fsp.readFile(TRIPS_JSON, ENCODING);
            this.tripList = json;
        } catch (e) {
            if (e.errno === -2) {
                await fsp.appendFile(TRIPS_JSON, JSON.stringify([]));
                this.load();
            }
        }
    }

    async save () {
        await fsp.writeFile(TRIPS_JSON, JSON.stringify(this.tripList));
    }
}

module.exports = TripHandler;
