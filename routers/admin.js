const Router = require('koa-router');
const User = require('../models/User');
const Category = require('../models/Category');
const Content = require('../models/Content');

const admin = new Router();

//在这个中间件中得到模板所需的数据
admin.use(async(ctx, next) => {  
	//用来格式化日期的一个库,用在模板中
	ctx.state.moment = require('moment');
 
	var userCount = await User.count();

	ctx.state.userMsg = {
    	page: Number(ctx.query.page) || 1,        //翻到的页数
    	limit: 4,                                 //每页显示的用户数
    	pages: 0,                                 //总页数
    	userCount: userCount                      //用户信息数量
    }

 	var categoryCount = await Category.count();

	ctx.state.categoryMsg = {
    	page: Number(ctx.query.page) || 1,      
    	limit: 4,                                
    	pages: 0,                                 
    	categoryCount: categoryCount                      
    }

  	var contentCount = await Content.count();

	ctx.state.contentMsg = {
    	page: Number(ctx.query.page) || 1,      
    	limit: 4,                                
    	pages: 0,                                 
    	contentCount: contentCount                      
    }  

	if(ctx.cookies.get('userMsg')){   
		ctx.state.userInfo = JSON.parse(ctx.cookies.get('userMsg'));
		var userInfo = ctx.state.userInfo;

	    await User.findById(userInfo._id, function(err, doc){
			if(doc){
				userInfo.isAdmin = doc.isAdmin;
				if(!userInfo.isAdmin){
					ctx.body = "只有管理员才能进入后台管理";
				}
			}

			if(err){
				console.log(err);
			}
		})

		await next();
	}
})

admin.get('/', async(ctx) => {
	await ctx.render('admin/index'); //模板路径
})

//用户信息页面
admin.get('/usermsg', async(ctx) => {    
	var userMsg = ctx.state.userMsg;

	userMsg.pages = Math.ceil(userMsg.userCount / userMsg.limit);
	userMsg.page = userMsg.page > userMsg.pages ? userMsg.pages : userMsg.page;         //page不能大于pages,不能小于1
	userMsg.page = userMsg.page < 1 ? 1 : userMsg.page;

	var skip = (userMsg.page - 1) * userMsg.limit;                  //每页从第几个用户信息开始读取

	await User.find().limit(userMsg.limit).skip(skip).exec(function(err, doc){
		if(doc){
			ctx.state.users = doc;
		}

		if(err){
			console.log(err);
		}
	})

	await ctx.render('admin/usermsg');
})

//博客分类页面
admin.get('/category', async(ctx) => {
	var categoryMsg = ctx.state.categoryMsg;

	categoryMsg.pages = Math.ceil(categoryMsg.categoryCount / categoryMsg.limit);
	categoryMsg.page = categoryMsg.page > categoryMsg.pages ? categoryMsg.pages : categoryMsg.page;         //page不能大于pages,不能小于1
	categoryMsg.page = categoryMsg.page < 1 ? 1 : categoryMsg.page;

	var skip = (categoryMsg.page - 1) * categoryMsg.limit;                 

	//_id中包含时间戳,-1是降序,1是升序
	await Category.find().sort({_id: -1}).limit(categoryMsg.limit).skip(skip).exec(function(err, doc){
		if(doc){
			ctx.state.categories = doc;
		}

		if(err){
			console.log(err)
		}
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

    //查询数据库是否存在同名分类
    var isExist = await Category.findOne({name: name}, function(err, doc){
    	if(doc){
    		return doc;
    	}else{
    		var category = new Category({name: name});
    		category.save();
    		return doc;
    	}

    	if(err){
    		console.log(err);
    	}
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
	var isExist = await Category.findOne({_id: id}, function(err, doc){
		if(doc){
			return doc;
		}

		if(err){
			console.log(err);
		}
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
	var isExist = await Category.findOne({_id: id}, function(err, doc){
		if(doc){
			return doc;
		}

		if(err){
			console.log(err);
		}
	})

	if(isExist){
		//检查用户是否修改名称
		if(isExist.name === name){
			await ctx.render('admin/success', {message: '修改成功', url: '/admin/category'})
		}else{
			//检查数据库中是否有相同名称的分类
			var ctgIsExist = await Category.find({_id: {$ne: id}, name: name}, function(err, doc){  //用findOne()出错？？？
				if(doc){
					return doc;
				}

				if(err){
					console.log(err);
				}
			})

			if(ctgIsExist.length > 0){   //find()返回一个对象,findOne()返回一个数组
				await ctx.render('admin/error', {message: '数据库已存在同名分类'});
			}else{				
				await Category.update({_id: id}, {name: name});
				await ctx.render('admin/success', {message: '修改成功', url: '/admin/category'});
			}
		}
	}else{
		await ctx.render('admin/error', {message: '分类信息不存在'})
	}
})

//分类删除
admin.get('/category/delete', async(ctx) => {
	var id = ctx.query.id || '';

	await Category.remove({_id: id});
	await ctx.render('admin/success', {message: '删除成功', url: '/admin/category'})
})

//内容首页
admin.get('/content', async(ctx) => {
	var contentMsg = ctx.state.contentMsg;

	contentMsg.pages = Math.ceil(contentMsg.contentCount / contentMsg.limit);
	contentMsg.page = contentMsg.page > contentMsg.pages ? contentMsg.pages : contentMsg.page;         //page不能大于pages,不能小于1
	contentMsg.page = contentMsg.page < 1 ? 1 : contentMsg.page;

	var skip = (contentMsg.page - 1) * contentMsg.limit;                 
	await Content.find().limit(contentMsg.limit).skip(skip).populate(['category', 'user']).sort({addTime: -1}).exec(function(err, doc){
		if(doc){
			ctx.state.contents = doc;
		}

		if(err){
			console.log(err);
		}
	})

	await ctx.render('admin/content_index');
})

//内容添加
admin.get('/content/add', async(ctx) => {
	var categories = await Category.find();
	await ctx.render('admin/content_add', {categories: categories});
})

//内容添加
admin.post('/content/add', async(ctx) => {
	if(ctx.request.body.title && ctx.request.body.description && ctx.request.body.content){
		var content = new Content({
			user: ctx.state.userInfo._id,
			category: ctx.request.body.category,
			title: ctx.request.body.title,
			description: ctx.request.body.description,
			content: ctx.request.body.content
		})

		content.save();
		await ctx.render('admin/success', {message: '保存成功', url: '/admin/content'});
		return;
	}

	await ctx.render('admin/error', {message: '各项信息不能为空!'})
})

//编辑内容页面
admin.get('/content/edit', async(ctx) => {
	var id = ctx.query.id || '';

    //查询数据库中是否存在
	var isExist = Content.findOne({_id: id}).populate('category');

	var categories = Category.find();
     
	if(isExist){
		await ctx.render('admin/content_edit', {content: isExist, categories: categories});
	}else{
		await ctx.render('admin/error', {message: '内容信息不存在'})
	}
})

//编辑内容保存
admin.post('/content/edit', async(ctx) => {
	var id = ctx.query.id || '';

	if(ctx.request.body.title && ctx.request.body.description && ctx.request.body.content){
		await Content.update({_id: id},{
				category: ctx.request.body.category,
				title: ctx.request.body.title,
				description: ctx.request.body.description,
				content: ctx.request.body.content
		    });

		await ctx.render('admin/success', {message: '保存成功', url: '/admin/content'});
	}

})

//内容删除
admin.get('/content/delete', async(ctx) => {
	var id = ctx.query.id || '';

	await Content.remove({_id: id});

	await ctx.render('admin/success', {message: '删除成功', url: '/admin/content'})
})
module.exports = admin;