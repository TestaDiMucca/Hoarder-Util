const loadResult = require('dotenv').config();
const express = require('express');
const app = express();
const { PORT } = require('./constants');

if (loadResult.error) {}

app.get('/', (req, res) => res.send('こんにちは, 「ZA WARUDO」!'));

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
