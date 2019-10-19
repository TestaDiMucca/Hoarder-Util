const loadResult = require('dotenv').config();
const express = require('express');
const app = express();

const Logger = require('./modules/Logger');
const { PORT } = require('./constants');

if (loadResult.error) {}

app.get('/', (req, res) => res.send('こんにちは, 「ZA WARUDO」!'));

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
