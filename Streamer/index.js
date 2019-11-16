const loadResult = require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');

const app = express();

const db = require('./Objects/Database');
const {
	PORT,
} = require('./constants');
const {
	getThumbPath,
	handleRequest,
	streamFile,
} = require('./Handlers/LibraryHandler');
const {
	markWatchedForUser,
	registerUser,
} = require('./Handlers/UserHandler');
const UploadHandler = require('./Handlers/UploadHandler');

if (loadResult.error) {
	Logger.error(`Error with loading config: ${loadResult.error.message ? loadResult.error.message : loadResult.error}`);
}

if (!db.initiated) db.init();
const server = http.createServer(app);
UploadHandler.addListeners(server);

const staticPath = path.resolve(`${__dirname}/public`);

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
	res.send('こんにちは, 「ZA WARUDO」!');
});

/* Main supported routes on the router */
/* May be better just to place the client under /ui route */
app.get(['/', '/upload', '/show/*?', '/upload'], (req, res) => {
	res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

app.get('/usage', async (req, res) => {
	const data = await UploadHandler.checkDiskUsage();
	res.send(data);
});

/** Handle library related actions here */
app.all('/library/:show?', async (req, res) => {
	const data = await handleRequest(req, res);
	res.status(200).send(data);
});

app.get('/player/:show/:filename', (req, res) => {
	const { filename, show } = req.params;
	streamFile(decodeURIComponent(show), decodeURIComponent(filename), req, res);
});

app.get('/thumb/:name', async (req, res) => {
	const { name } = req.params;
	res.status(200).sendFile(await getThumbPath(name));
});

app.post('/login/:name', async (req, res) => {
	const { name } = req.params;
	const id = await registerUser(name);
	console.log(`[login] ${name} -> id ${id}`);
	res.status(200).send({ id });
});

app.post('/watched/:name/:file', (req, res) => {
	const { file, name } = req.params;
	markWatchedForUser(decodeURIComponent(name), decodeURIComponent(file));
	res.end();
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
