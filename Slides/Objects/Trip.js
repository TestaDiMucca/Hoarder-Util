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
        await super.load(Trip.dbTable);
        await this.loadDays();
    }

    async delete () {
        await TripDay.removeAssociatedDays(this.id);
        return await super.delete(Trip.dbTable);
    }

    async loadDays () {
        this.days = await TripDay.loadDays(this.id);
        this.evaluateStartEnd();
    }

    evaluateStartEnd () {
        const sorted = [...this.days].sort((a, b) => Date.parse(a) > Date.parse(b));
        if (sorted.length <= 0) return;
        this.startDate = sorted[0].date;
        this.endDate = sorted[sorted.length - 1].date;
    }

    static async loadTrips () {
        let rows = await db.all(`SELECT * FROM ${Trip.dbTable}`);

        return rows.map(async row => {
            let newTrip = new Trip(row.id);
            newTrip.setProperties(row);
            await newTrip.loadDays();
            return newTrip;
        });
    }
}

Trip.dbTable = 'trips';

module.exports = Trip;