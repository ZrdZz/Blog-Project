const Router = require('koa-router');
const User = require('../models/User');
const Category = require('../models/Category');

const admin = new Router();

//在这个中间件中得到模板所需的数据
admin.use(async(ctx, next) => {  
	var userCount = await new Promise(function(resolve, reject){
		User.count(function(err, userCount){
			if(userCount){
				resolve(userCount);
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
    	userCount: userCount                      //用户信息数量
    }

 	var categoryCount = await new Promise(function(resolve, reject){
		Category.count(function(err, categoryCount){
			if(categoryCount){
				resolve(categoryCount);
			}

			if(err){
				reject(err);
			}
		});
	})
	ctx.state.categoryMsg = {
    	page: Number(ctx.query.page) || 1,      
    	limit: 4,                                
    	pages: 0,                                 
    	categoryCount: categoryCount                      
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
	//如果想在所有路由中使用数据,就必须在use中得到他

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

    // ctx.state.userMsg = {
    // 	 page: Number(ctx.query.page) || 1,        //翻到的页数
    // 	 limit: 4,                            //每页显示的用户数
    // 	 pages: 0,                            //总页数
    // 	 count: count                         //用户信息数量
    // }

	var userMsg = ctx.state.userMsg;

	ctx.state.users = await new Promise(function(resolve, reject){
		userMsg.pages = Math.ceil(userMsg.userCount / userMsg.limit);
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
	var categoryMsg = ctx.state.categoryMsg;

	ctx.state.categories = await new Promise(function(resolve, reject){
		categoryMsg.pages = Math.ceil(categoryMsg.categoryCount / categoryMsg.limit);
		categoryMsg.page = categoryMsg.page > categoryMsg.pages ? categoryMsg.pages : categoryMsg.page;         //page不能大于pages,不能小于1
		categoryMsg.page = categoryMsg.page < 1 ? 1 : categoryMsg.page;

		var skip = (categoryMsg.page - 1) * categoryMsg.limit;                 

		Category.find().limit(categoryMsg.limit).skip(skip).exec(function(err, doc){
			if(doc){
				resolve(doc);
			}

			if(err){
				reject(err);
			}
		})
	})

	await ctx.render('admin/category_index');
})

//博客分类页面
admin.get('/category/add', async(ctx) => {
	await ctx.render('admin/category_add');
})

//博客分类处理
admin.post('/category/add', async(ctx) => {
	var name = ctx.request.body.name;

	if(!name){
	  await ctx.render('admin/error', {message: '名称不能为空'})
	  return;
    }

    // await new Promise(function(resolve, reject){
    // 	Category.findOne({name: name}, function(err, doc){
    // 		if(doc){
    // 			resolve(doc)
    // 		}else{
    // 			var category = new Category({name: name});
    // 			category.save();
    // 			ctx.render('admin/success', {message: '分类创建成功', url: '/category/add'});
    // 			resolve(doc);
    // 		}

    // 		if(err){
    // 			reject(err);
    // 		}
    // 	})
    // })

    //查询数据库是否存在同名分类
    var isExist = await new Promise(function(resolve, reject){
    	Category.findOne({name: name}, function(err, doc){
    		if(doc){
    			resolve(doc)
    		}else{
    			var category = new Category({name: name});
    			category.save();
    			resolve(doc);
    		}

    		if(err){
    			reject(err);
    		}
    	})
    })

    if(isExist){
    	await ctx.render('admin/error', {message: '分类已存在'});
    }else{
    	await ctx.render('admin/success', {message: '分类创建成功', url: '/admin/category'});
    }

})

//编辑分类页面
admin.get('/category/edit', async(ctx) => {
	var id = ctx.query.id || '';

    //查询数据库中是否存在
	var isExist = await new Promise(function(resolve, reject){
		Category.findOne({_id: id}, function(err, doc){
			if(doc){
				resolve(doc)
			}

			if(err){
				reject(err);
			}
		})
	})

	if(isExist){
		await ctx.render('admin/category_edit', {category: isExist});
	}else{
		await ctx.render('admin/error', {message: '分类信息不存在'})
	}
})

//分类保存
admin.post('/category/edit', async(ctx) => {
	var id = ctx.query.id || '',
		name = ctx.request.body.name;

	//查询数据库中是否存在
	var isExist = await new Promise(function(resolve, reject){
		Category.findOne({_id: id}, function(err, doc){
			if(doc){
				resolve(doc)
			}

			if(err){
				reject(err);
			}
		})
	})

	if(isExist){
		//检查用户是否修改名称
		if(isExist.name === name){
			await ctx.render('admin/success', {message: '修改成功', url: '/admin/category'})
		}else{
			//检查数据库中是否有相同名称的分类
			var ctgIsExist = await new Promise(function(resolve, reject){
				Category.find({_id: {$ne: id}, name: name}, function(err, doc){
					if(doc){
						resolve(doc);
					}

					if(err){
						reject(err);
					}
				})
			})

			if(ctgIsExist.length > 0){   //若返回空数组也为true
				await ctx.render('admin/error', {message: '数据库已存在同名分类'})
			}else{				
				await new Promise(function(resolve, reject){
					Category.update({_id: id}, {name: name}, function(err, num){
						if(err){
							reject(err);
						}

						resolve(num);
					});
				})
				await ctx.render('admin/success', {message: '修改成功', url: '/admin/category'})
			}
		}
	}else{
		await ctx.render('admin/error', {message: '分类信息不存在'})
	}
})

module.exports = admin;