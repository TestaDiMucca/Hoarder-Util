class BaseObject {
    constructor(id) {
        this.id = id;
    }

    async save () {
        if (this.id) {
            return await this.update();
        } else {
            return await this.create();
        }
    }

    async load (table) {
        const sql = `SELECT * FROM ${table} WHERE id = ?`;
        const info = await db.get(sql, [this.id]);
        this.setProperties(info);
    }

    async create () {

    }

    async update () {

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
