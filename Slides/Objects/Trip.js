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
        const sql = `UPDATE ${Trip.dbTable} SET title = ? WHERE id = ?`;
        return await db.run(sql, [this.title, this.id]);
    }

    async load () {
        return await super.load(Trip.dbTable);
    }

    async delete () {
        return await super.delete(Trip.dbTable);
    }

    async loadDays () {
        this.evaluateStartEnd();
    }

    evaluateStartEnd () {

    }

    static async loadTrips () {
        let rows = await db.all(`SELECT * FROM ${Trip.dbTable}`);

        return rows.map(row => {
            let newTrip = new Trip(row.id);
            newTrip.setProperties(row);
            return newTrip;
        });
    }
}

Trip.dbTable = 'trips';

module.exports = Trip;