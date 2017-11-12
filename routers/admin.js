const Router = require('koa-router');

const admin = new Router();

admin.get('/user', async(ctx) => {
	ctx.body = 'admin-user';
})

module.exports = admin;