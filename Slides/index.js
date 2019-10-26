const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();

const FileHandler = require('./FileHandler');

const PORT = process.env.PORT || 4001;
const SCAN_PATH = process.env.SCAN_PATH || null;

if (!SCAN_PATH) {
    console.log('Please configure a scan path in the .env file. See .env.example if needed.');
    process.exit();
}

let handlerInstance = new FileHandler(SCAN_PATH, true);

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
})

const init = async () => {
    await handlerInstance.init();
    app.listen(PORT, () => console.log(`\x1b[36mListening on port ${PORT}!\x1b[0m`));
};

init();
