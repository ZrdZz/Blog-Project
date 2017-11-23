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
	var page = Number(ctx.query.page),          //翻到的页数
	    limit = 4,                              //每页显示的用户数
	    pages = 0;                              //总页数
    
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

	var users = await new Promise(function(resolve, reject){
		pages = Math.ceil(count / limit);
		page = page > pages ? pages : page;         //page不能大于pages,不能小于1
		page = page < 1 ? 1 : page;

		var skip = (page - 1) * limit;                  //每页从第几个用户信息开始读取

		User.find().limit(limit).skip(skip).exec(function(err, doc){
			if(doc){
				resolve(doc);
			}

			if(err){
				reject(err);
			}
		})
	})

	await ctx.render('admin/usermsg', {userInfo: userInfo, users: users, page: page, count: count, limit: limit});
})

module.exports = admin;