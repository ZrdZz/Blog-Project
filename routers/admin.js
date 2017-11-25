const Router = require('koa-router');
const User = require('../models/User.js');

const admin = new Router();

admin.use(async(ctx, next) => {  
	var count = await new Promise(function(resolve, reject){
		User.count(function(err, count){
			if(count){
				resolve(count);
			}

			if(err){
				reject(err);
			}
		});
	})
	ctx.state.userMsg = {
    	page: Number(ctx.query.page) || 1,        //翻到的页数
    	limit: 4,                                 //每页显示的用户数
    	pages: 0,                                 //总页数
    	count: count                              //用户信息数量
    }

	if(ctx.cookies.get('userMsg')){   
		ctx.state.userInfo = JSON.parse(ctx.cookies.get('userMsg'));
		var userInfo = ctx.state.userInfo;

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
	await ctx.render('admin/index'); //模板路径
})

//用户信息页面
admin.get('/usermsg', async(ctx) => {    
	//如果想在所有路由中使用数据,就必须在注册路由前,注册一个中间件得到她

	// var count = await new Promise(function(resolve, reject){
	// 	User.count(function(err, count){
	// 		if(count){
	// 			resolve(count);
	// 		}

	// 		if(err){
	// 			reject(err);
	// 		}
	// 	});
	// })

 //    ctx.state.userMsg = {
 //    	page: Number(ctx.query.page) || 1,        //翻到的页数
 //    	limit: 4,                            //每页显示的用户数
 //    	pages: 0,                            //总页数
 //    	count: count                         //用户信息数量
 //    }

	var userMsg = ctx.state.userMsg;

	ctx.state.users = await new Promise(function(resolve, reject){
		userMsg.pages = Math.ceil(userMsg.count / userMsg.limit);
		userMsg.page = userMsg.page > userMsg.pages ? userMsg.pages : userMsg.page;         //page不能大于pages,不能小于1
		userMsg.page = userMsg.page < 1 ? 1 : userMsg.page;

		var skip = (userMsg.page - 1) * userMsg.limit;                  //每页从第几个用户信息开始读取

		User.find().limit(userMsg.limit).skip(skip).exec(function(err, doc){
			if(doc){
				resolve(doc);
			}

			if(err){
				reject(err);
			}
		})
	})

	await ctx.render('admin/usermsg');
})

//博客分类页面
admin.get('/category', async(ctx) => {
	await ctx.render('admin/category');
})

module.exports = admin;