const db = require('./Database');
const TripDay = require('./TripDay');
const BaseObject = require('./BaseObject');

class Trip extends BaseObject {
    constructor (id) {
        super(id);
        this.startDate = '';
        this.endDate = '';
        this.title = '';
        /** @type TripDay[] */
        this.days = [];
    }

    async create () {
        const sql = `INSERT INTO ${Trip.dbTable} (title) VALUES (?)`;
        return await db.run(sql, [this.title]);
    }

    async update () {

    }

    async load () {
        await super.load(Trip.dbTable);
    }

    async delete () {
        const sql = `DELETE FROM ${Trip.dbTable} WHERE id = ?`;
        return await db.run(sql, [this.id]);
    }

    loadDays () {

    }

    evaluateStartEnd () {

    }

    static async loadTrips () {
        let result = await db.all(`SELECT * FROM ${Trip.dbTable}`);
    }
}

Trip.dbTable = 'trips';

module.exports = Trip;