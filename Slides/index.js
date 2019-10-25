const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();

const FileHandler = require('./FileHandler');

const PORT = process.env.PORT || 4001;
const SCAN_PATH = process.env.SCAN_PATH || null;

if (!SCAN_PATH) {
    console.log('Please configure a scabn path in the .env file. See .env.example if needed.');
    process.exit();
}

let handlerInstance = new FileHandler(SCAN_PATH, true);

const staticPath = path.resolve(__dirname + '/public'); 
app.use(express.static(staticPath));

const init = async () => {
    await handlerInstance.init();
    app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
};

init();

