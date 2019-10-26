const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();

const FileHandler = require('./FileHandler');
const ConfigHandler = require('./ConfigHandler');

const { DEFAULT_PORT, DEFAULT_SCAN_PATH } = require('./constants');

const PORT = process.env.PORT || DEFAULT_PORT;
const SCAN_PATH = process.env.SCAN_PATH || DEFAULT_SCAN_PATH;

if (!SCAN_PATH) {
    console.log('Please configure a scan path in the .env file. See .env.example if needed.');
    process.exit();
}

let handlerInstance = new FileHandler(SCAN_PATH, true);
let configInstance = new ConfigHandler();

const staticPath = path.resolve(__dirname + '/public'); 
app.use(express.static(staticPath));

// app.use((req, res, next) => {
//     console.log(`[index] ${req.method} to ${req.originalUrl}`);
//     next();
// });

app.get('/list', (req, res) => {
    if (handlerInstance.status === FileHandler.STATUS.READY) {
        res.send(handlerInstance.list);
    } else {
        res.send({ message: handlerInstance.status });
    }
});

app.get('/image', (req, res) => {
    const { path } = req.query;
    const usePath = decodeURIComponent(path);
    if (handlerInstance.validatePath(usePath)) {
        res.sendFile(usePath);
    } else {
        res.status(400).send({ message: 'Invalid path' });
    }
});

app.get('/config', (req, res) => {
    let data = configInstance.getConfig();
    res.status(200).send(data);
});

const init = async () => {
    try {
        await configInstance.load();
        const config = configInstance.getConfig();
        if (config.scanPath) handlerInstance.setNewScanPath(config.scanPath);
        await handlerInstance.init(config);
        app.listen(PORT, () => console.log(`\x1b[36m[index] Listening on port ${PORT}!\x1b[0m`));
    } catch (e) {
        console.error('[index] Error on init', e);
        process.exit();
    }
};

init();
