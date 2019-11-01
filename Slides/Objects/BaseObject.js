const db = require('./Database');
const Tools = require('./Tools');

class BaseObject {
    constructor(id) {
        this.id = id;
        this.loaded = false;
    }

    /**
     * Call create or update depending on if ID already exists.
     */
    async save () {
        if (this.id) {
            return await this.update();

        } else {
            let res = await this.create();
            if (res) this.id = res;
            return res;
        }
    }

    /**
     * @param {string} table Name of the table to load from
     */
    async load (table) {
        if (this.loaded) return;
        const sql = `SELECT * FROM ${table} WHERE id = ?`;
        const info = await db.get(sql, [this.id]);
        if (info) this.loaded = true;
        this.setProperties(Tools.processRow(info));
    }

    async create () {

    }

    async update () {

    }

    async delete (table) {
        const sql = `DELETE FROM ${table} WHERE id = ?`;
        return await db.run(sql, [this.id]);
    }

    /**
     * Apply an info object's properties into the object
     * @param {*} info 
     */
    setProperties (info) {
        Object.keys(info).forEach(key => {
            if (this[key] !== undefined)
                this[key] = info[key];
        });
    }
}

module.exports = BaseObject;
