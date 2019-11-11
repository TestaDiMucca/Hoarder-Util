const db = require('../Objects/Database');

/**
 * Make sure this user has an entry in the db.
 * @param {string} name 
 */
const registerUser = async (name) => {
    const existingUser = await db.get('SELECT id FROM users WHERE name = ?', [name]);
    if (!existingUser) {
        return await db.run('INSERT INTO users (name) VALUES (?)', [name]);
    } else {
        return existingUser.id;
    }
};

const markWatchedForUser = async (name, path) => {
    // const existingUser = await db.get('SELECT id FROM users WHERE name = ?', [name]);
};

module.exports = {
    markWatchedForUser,
    registerUser
};
