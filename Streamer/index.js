const loadResult = require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const {
    PORT
} = require('./constants');
const {
    scanLibrary
} = require('./Handlers/LibraryHandler');

if (loadResult.error) {
    Logger.error(`Error with loading config: ${loadResult.error.message ? loadResult.error.message : loadResult.error}`);
}

const staticPath = path.resolve(__dirname + '/public');

/** Ensure the save directories exist so we don't error when writing */
if (!!process.env.SAVE_PATH && !fs.existsSync(process.env.SAVE_PATH)) {
    fs.mkdirSync(process.env.SAVE_PATH);
}

/* Configure Middleware */
app.use(express.static(staticPath));
app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE');
    next();
});

app.use((req, res, next) => {
    console.log(`[index] ${req.method} to ${req.originalUrl}`);
    next();
});

app.get('/test', (req, res) => {
    res.send('こんにちは, 「ZA WARUDO」!')
});

app.get('/library/:show?', async (req, res) => {
    const show = req.params.show;
    let data = await scanLibrary(show);
    res.status(200).send(data);
});

app.get('/player', (req, res) => {

});

app.post('/login/:name', (req, res) => {
    const name = req.params.name;
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
