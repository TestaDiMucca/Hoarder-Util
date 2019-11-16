const loadResult = require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const { DIRECORY_LIST } = require('./constants');

const Logger = require('./modules/Logger');

const {
    PORT
} = require('./constants');
const {
    handleDownload,
    handleGetInfo
} = require('./modules/downloadHandler');
const {
    handleRenames
} = require('./modules/dateRenameHandler');
const {
    handleMigration
} = require('./modules/migrationHandler');

if (loadResult.error) {
    console.error(`Error with loading config: ${loadResult.error.message ? loadResult.error.message : loadResult.error}`);
}

const staticPath = path.resolve(__dirname + '/public'); 

/** Ensure the save directories exist so we don't error when writing */
if (!!process.env.SAVE_PATH && !fs.existsSync(process.env.SAVE_PATH)) {
    fs.mkdirSync(process.env.SAVE_PATH);
}

/* Configure Middleware */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(staticPath));

app.use((req, res, next) => {
    console.log(`[index] ${req.method} to ${req.originalUrl}`);
    next();
});

app.get('/test', (req, res) => {
    res.send('こんにちは, 「ZA WARUDO」!')
});
app.get('/barebones', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/barebones.html'));
});

app.get('/directory', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/directory.html'));
});
app.get('/directory-list', (req, res) => {
    res.status(200).send(DIRECORY_LIST);
});

app.post('/test', (req, res) => {
    res.send('こんにちは, 「ZA WARUDO」! (POST ed.)')
});
app.post('/download', (req, res) => handleDownload(req, res));
app.post('/info', (req, res) => handleGetInfo(req, res));
app.post('/rename', (req, res) => handleRenames(req, res));
app.post('/migrate', (req, res) => handleMigration(req, res));

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
