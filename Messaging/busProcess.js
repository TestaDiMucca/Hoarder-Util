const Koa = require('koa');
const router = require('koa-router')();
const koaBody = require('koa-body');
const app = module.exports = new Koa();

const { BUS_PORT } = require('./constant');

/**
 * Handle posting a new message
 * @param {*} req 
 */
const handleNewMessage = async req => {
    console.log(req.request.body);
    req.body = 'Here is reply thanking you';
};

/* Do all the Koa stuff here */
app.use(koaBody());
router.post('/message', handleNewMessage);
app.use(router.routes());
app.listen(BUS_PORT);
