const loadResult = require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();

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

if (loadResult.error) {
    Logger.error(`Error with loading config: ${loadResult.error.message ? loadResult.error.message : loadResult.error}`);
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

app.get('/test', (req, res) => res.send('こんにちは, 「ZA WARUDO」!'));

app.post('/download', (req, res) => handleDownload(req, res));
app.post('/info', (req, res) => handleGetInfo(req, res));
app.post('/rename', (req, res) => handleRenames(req, res));

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
