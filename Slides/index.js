const express = require('express');
const minify = require('express-minify');
const path = require('path');
const app = express();
require('dotenv').config();

const FileHandler = require('./modules/FileHandler');
const ConfigHandler = require('./modules/ConfigHandler');

const { DEFAULT_PORT, DEFAULT_SCAN_PATH } = require('./constants');

const PORT = process.env.PORT || DEFAULT_PORT;
const SCAN_PATH = process.env.SCAN_PATH || DEFAULT_SCAN_PATH;

let handlerInstance = new FileHandler(SCAN_PATH, true);
let configInstance = new ConfigHandler();

const staticPath = path.resolve(__dirname + '/public'); 
app.use(minify());
app.use(express.static(staticPath));

app.get('/list', async (req, res) => {
    const { shuffled, newShuffle } = req.query;
    if (handlerInstance.status === FileHandler.STATUS.READY) {
        if (!!newShuffle) {
            res.send(await handlerInstance.getNewShuffle());
        } else {
            res.send(!!shuffled ? handlerInstance.shuffled : handlerInstance.list);
        }
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

app.get('/exif', async (req, res) => {
    const { path } = req.query;
    const usePath = decodeURIComponent(path);
    const ret = await FileHandler.getExif(usePath);
    res.send(ret);
});

app.post('/edit', async (req, res) => {
    const { path, method } = req.query;
    const usePath = decodeURIComponent(path);
    const ret = await FileHandler.editImage(usePath, method);
    res.send(ret);
});

app.get('/config', (req, res) => {
    let data = configInstance.getConfig();
    res.status(200).send(data);
});

app.post('/rescan', (req, res) => {
    handlerInstance.init(configInstance.getConfig(), true);
    res.end();
});

app.post('/dump-shuffle', async (req, res) => {
    await handlerInstance.dumpShuffle();
    res.end();
});

app.post('/shuffle-after', async (req, res) => {
    const { index } = req.query;
    const data = await handlerInstance.shuffleAfter(+index);
    res.send(data);
});

const init = async () => {
    try {
        await configInstance.load();
        const config = configInstance.getConfig();
        /* Maybe we want to just pass a reference to the config? */
        if (config.scanPath) handlerInstance.setNewScanPath(config.scanPath);
        await handlerInstance.init(config);
        app.listen(PORT, () => console.log(`\x1b[36m[index] Listening on port ${PORT}!\x1b[0m`));
    } catch (e) {
        console.error('\x1b[31m[index] Error on init', e, '\x1b[0m');
        process.exit();
    }
};

init();
