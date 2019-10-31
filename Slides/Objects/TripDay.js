const BaseObject = require('./BaseObject');
const db = require('./Database');

class TripDay extends BaseObject {
    constructor (id) {
        super(id);
        this.tripID = 0;
        this.date = '';
        this.description = '';
    }

    async create() {
        if (!this.tripID) return;
        const sql = `INSERT INTO ${TripDay.dbTable} (description, date, trip_id) VALUES (?, ?, ?)`;
        return await db.run(sql, [this.description, this.date, this.tripID]);
    }

    async update() {
        const sql = `UPDATE ${Trip.dbTable} SET description = ?, date = ? WHERE id = ?`;
        return await db.run(sql, [this.description, this.date]);
    }

    async load() {
        return await super.load(TripDay.dbTable);
    }

    async delete() {
        return await super.delete(TripDay.dbTable);
    }

    /**
     * 
     * @param {number} tripID 
     * @returns {Promise<TripDay[]>}
     */
    static async loadDays (tripID) {
        let rows = await db.all(`SELECT * FROM ${TripDay.dbTable} WHERE trip_id = ?`, [tripID]);

        return rows.map(row => {
            let newTripDay = new TripDay(row.id);
            newTripDay.setProperties(row);
            return newTripDay;
        });
    }
}

TripDay.dbTable = 'trip_days';

module.exports = TripDay;