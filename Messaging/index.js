/**
 * The entry point of the application, e.g. the web server
 */
const Koa = require('koa');
const router = require('koa-router')();
const koaBody = require('koa-body');
const app = module.exports = new Koa();

const { MAIN_PORT } = require('./constant');

/**
 * Handle an incoming post request and direct it to the message system
 * @param {*} req 
 */
const handleRequest = async req => {
    console.log(req.request.body);
    req.body = 'Here is reply thanking you';
};

/* Do all the Koa stuff here */
app.use(koaBody());
router.post('/request', handleRequest);
app.use(router.routes());
const server = app.listen(MAIN_PORT);
console.log('Server started with info:', server.address());