const Router = require('koa-router');
const User = require('../models/User.js');

const admin = new Router();

var userInfo = null; 

admin.use(async(ctx, next) => {              

	if(ctx.cookies.get('userMsg')){   
		userInfo = JSON.parse(ctx.cookies.get('userMsg'));

		userInfo.isAdmin = await new Promise(function(resolve, reject){
			User.findById(userInfo._id, function(err, doc){
				if(doc){
					resolve(doc.isAdmin);
				}

				if(err){
					reject(err);
				}
			})
		})

		if(!userInfo.isAdmin){
			ctx.body = "只有管理员才能进入后台管理";
		}else{
			await next();
		}
	}
})

admin.get('/', async(ctx) => {
	await ctx.render('admin/index', {userInfo: userInfo}); //模板路径
})

admin.get('/usermsg', async(ctx) => {

	//从数据库读取所有用户数据
	users = await new Promise(function(resolve, reject){
		User.find(function(err, doc){
			if(doc){
				resolve(doc);
			}

			if(err){
				reject(err);
			}
		})
	})
	
	await ctx.render('admin/usermsg', {userInfo: userInfo, users: users});
})

module.exports = admin;