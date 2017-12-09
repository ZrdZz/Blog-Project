const Router = require('koa-router');
const User = require('../models/User');
const Category = require('../models/Category');
const Content = require('../models/Content');

const main = new Router();

main.use(async(ctx, next) => { 
	ctx.state.moment = require('moment'); 

	if(ctx.cookies.get('userMsg')){   //刷新页面后,检查是否能拿到cookie,若拿不到就把空对象传给模板,这里一定要if检测一下,否则JSON.parse(undefined)会报错
		ctx.state.userInfo = JSON.parse(ctx.cookies.get('userMsg'));

		//获取当前登录用户的类型,是否是管理员
		await User.findById(ctx.state.userInfo._id, function(err, doc){
				if(doc){
					ctx.state.userInfo.isAdmin = doc.isAdmin;
				}

				if(err){
					console.log(err);
				}
			})
	}

	ctx.state.categoryId = {},      //通过数据库查询博客分类页面的内容
		categoryQuery = ctx.query.category || '';
	if(categoryQuery){
		ctx.state.categoryId.category = categoryQuery;
	}

	var contentCount;
  	await Content.find(ctx.state.categoryId).count(function(err, count){
  		if(count >= 0){
  			contentCount = count;
  		}

  		if(err){
  			console.log(err);
  		}
  	});

	ctx.state.contentMsg = {
    	page: Number(ctx.query.page) || 1,      
    	limit: 3,                                
    	pages: 0,                                 
    	contentCount: contentCount                     
    }

    	//获取博客分类
	ctx.state.data = {};
    
	await Category.find().exec(function(err, doc){
		if(doc){
			ctx.state.data.categories = doc;
		}
				
		if(err){
			ctx.state.data.categories = err;
		}
	})

	await next();	
})

main.get('/', async(ctx) => {
	var contentMsg = ctx.state.contentMsg;

	ctx.state.data.contents = await new Promise(function(resolve, reject){
		contentMsg.pages = Math.ceil(contentMsg.contentCount / contentMsg.limit);
		contentMsg.page = contentMsg.page > contentMsg.pages ? contentMsg.pages : contentMsg.page;         //page不能大于pages,不能小于1
		contentMsg.page = contentMsg.page < 1 ? 1 : contentMsg.page;

		var skip = (contentMsg.page - 1) * contentMsg.limit;   

		Content.find(ctx.state.categoryId).limit(contentMsg.limit).skip(skip).populate(['category', 'user']).sort({addTime: -1}).exec(function(err, doc){
			if(doc){
				resolve(doc);
			}

			if(err){
				reject(err);
			}
		})
	})
	
	await ctx.render('main/index');
})

//内容详情页
main.get('view', async(ctx) => {     //路径view前面不能加斜杠!!!
	var contentId = ctx.query.content;

	var contentarea = await new Promise(function(resolve, reject){
		Content.findOne({_id: contentId}).populate(['category', 'user']).exec(function(err, doc){
			if(doc){
				doc.views++;
				doc.save();
				resolve(doc);
			}

			if(err){
				reject(err);
			}
		})
	})

	await ctx.render('main/view', {contentarea: contentarea});
})

module.exports = main;