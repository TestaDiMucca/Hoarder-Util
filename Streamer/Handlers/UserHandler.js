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
    const sql = 'SELECT id FROM users_watched WHERE user_id=(SELECT id FROM users WHERE name = ?) AND path = ?';
    const alreadyWatched = await db.get(sql, [name, path]);
    if (!!alreadyWatched) return;
    const id = await registerUser(name);
    await db.run('INSERT INTO users_watched (user_id, path) VALUES (?, ?)', [id, path]);
    console.log(`[markWatchedForUser] #${id}:${name} watched ${path}`);
};

module.exports = {
    markWatchedForUser,
    registerUser
};
