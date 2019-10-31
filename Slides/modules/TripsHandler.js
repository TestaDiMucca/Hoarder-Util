const fs = require('fs');
const { promisify } = require('util');
const { resolve: pathResolve } = require('path');

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
 * Also this is probably better served in a DB, relational
 */
class TripHandler {
    constructor () {
        /** @type Trip[] */
        this.tripList = [];
    }

    /**
     * 
     * @param {'POST' | 'GET'} method
     * @param {Request} req 
     * @param {Response} res 
     */
    async handleRequest (method, req, res) {

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
