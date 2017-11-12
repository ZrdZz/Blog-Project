const Router = require('koa-router');

const api = new Router();

api.get('/user', async(ctx) => {
	ctx.body = 'api-user';
})

module.exports = api;