const Router = require('koa-router');

const main = new Router();

main.get('/', async(ctx) => {
	await ctx.render('main/index');
})

module.exports = main;