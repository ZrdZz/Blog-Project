const Koa = require('koa');
const views = require('koa-views');
const static = require('koa-static');
const Router = require('koa-router');
const path = require('path');
const mongoose = require('mongoose');
const body = require('koa-bodyparser');

const admin = require('./routers/admin.js');
const api = require('./routers/api.js');
const main = require('./routers/main.js');

const app = new Koa();
const router = new Router();
const staticPath = '/public';

//配置应用模板
app.use(views(__dirname + '/views', {extension: 'ejs'}));

//处理post请求将formData数据解析到ctx.request.body中
app.use(body());

//设置静态文件托管
app.use(static(__dirname + staticPath));

//根据不同的功能划分模块
router.use('/admin', admin.routes(), admin.allowedMethods());
router.use('/api', api.routes(), api.allowedMethods());
router.use('/', main.routes(), main.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());

mongoose.Promise = global.Promise;  //不加这个会多个警告Mongoose: mpromise (mongoose's default promise library) is deprecated
mongoose.connect('mongodb://localhost/blog', function(err){
	if(err){
		console.log('数据库连接失败');
	}else{
		console.log('数据库连接成功');
		app.listen(3000);
	}
})

