const Router = require('koa-router');
const User = require('../models/User');
const Category = require('../models/Category')

const main = new Router();

main.get('/', async(ctx) => {

	var userInfo = null;               

	if(ctx.cookies.get('userMsg')){   //刷新页面后,检查是否能拿到cookie,若拿不到就把空对象传给模板,这里一定要if检测一下,否则JSON.parse(undefined)会报错
		userInfo = JSON.parse(ctx.cookies.get('userMsg'));

		//获取当前登录用户的类型,是否是管理员
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
	}

	//获取博客分类
	var categories = await new Promise(function(resolve, reject){
		Category.find().exec(function(err, doc){
			if(doc){
				resolve(doc);
			}
				
			if(err){
				reject(err);
			}
		})
	})
	
	await ctx.render('main/index', {userInfo: userInfo, categories: categories});
})

module.exports = main;