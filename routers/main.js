const Router = require('koa-router');

const main = new Router();

main.get('/', async(ctx) => {
	ctx.body = 'main-user';
})

module.exports = main;