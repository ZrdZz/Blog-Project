const Router = require('koa-router');

const main = new Router();

main.get('/', async(ctx) => {

	var userInfo = null;               

	if(ctx.cookies.get('userMsg')){   //刷新页面后,检查是否能拿到cookie,若拿不到就把空对象传给模板,这里一定要if检测一下,否则JSON.parse(undefined)会报错
		userInfo = JSON.parse(ctx.cookies.get('userMsg'));
	}

	await ctx.render('main/index', {userInfo: userInfo});
})

module.exports = main;