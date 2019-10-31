const db = require('./Database');

class BaseObject {
    constructor(id) {
        this.id = id;
        this.loaded = false;
    }

    async save () {
        if (this.id) {
            return await this.update();
        } else {
            return await this.create();
        }
    }

    async load (table) {
        if (this.loaded) return;
        const sql = `SELECT * FROM ${table} WHERE id = ?`;
        const info = await db.get(sql, [this.id]);
        if (info) this.loaded = true;
        this.setProperties(info);
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
