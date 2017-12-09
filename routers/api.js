const Router = require('koa-router');
const User = require('../models/User.js');
const Content = require('../models/Content');
const moment = require('moment');

const api = new Router();

/*
 * 1. 用户名、密码不能为空
 * 2. 两次密码输入必须一致
 * 3. 数据库查询用户是否被注册
 */

//统一数据格式
var responseData = {
	code: 0,
	message: '',
	userMsg: null
};

//注册逻辑
api.post('/user/register', async(ctx) => {
	var username = ctx.request.body.username,
	    password = ctx.request.body.password,
	    repassword = ctx.request.body.repassword;

	//检测用户名是否为空
	if(username === ''){
		responseData.code = 1;
		responseData.message = '用户名不能为空';
		ctx.body = responseData;
		return;
	}

	//检测密码是否为空
	if(password === ''){
		responseData.code = 2;
		responseData.message = '密码不能为空';
		ctx.body = responseData;
		return;
	}

	//检测密码是否一致
	if(password !== repassword){
		responseData.code = 3;
		responseData.message = '密码输入不一致';
		ctx.body = responseData;
		return;
	}

    //检测用户名是否已被注册
	await User.findOne({username: username}, function(err, doc){
			if(doc){
	 			//表示数据库中有记录
	 			responseData.code = 4;
	 			responseData.message = '用户名已被注册';
	 			ctx.body = responseData;				
			}else{
				//保存用户消息到数据库
				var user = new User({'username': username, 'password': password});
				user.save();
				responseData.code = 0;
	 			responseData.message = '注册成功';
	 			ctx.body = responseData;				
			};

			if(err){
				console.log(err);
			}
	    })
});

//登录逻辑
api.post('/user/login', async(ctx) => {
	var username = ctx.request.body.username,
	    password = ctx.request.body.password;

	//检测用户名或密码是否为空
	if(username === '' || password === ''){
		responseData.code = 1;
		responseData.message = '用户名或密码不能为空';
		ctx.body = responseData;
		return;
	}

	//查询数据库中用户名或密码是否存在,若存在则登陆成功
	await User.findOne({username: username, password: password}, function(err, doc){
			if(doc){
				responseData.code = 0;
				responseData.message = '登录成功';
				responseData.userMsg = {_id: doc._id, username: doc.username}; 
				ctx.cookies.set('userMsg', JSON.stringify(responseData.userMsg));
				ctx.body = responseData;
			}else{
				responseData.code = 2;
				responseData.message = '用户名或密码错误';
				ctx.body = responseData;
			};

			if(err){
				console.log(err);
			}
		})
})

//登出逻辑
api.get('/user/logout', async(ctx) => {
	ctx.cookies.set('userMsg', null);
})

//评论提交
api.post('/comment/post', async(ctx) => {
	var contentId = ctx.request.body.contentId,
	    data = {
	    	username: ctx.request.body.username,
	    	date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
	    	content: ctx.request.body.comment
	    };

	ctx.body = await new Promise(function(resolve, reject){
		Content.findOne({_id: contentId}).exec(function(err, doc){
			if(doc){
				doc.comments.push(data);     //将评论添加进数组
				doc.save();
				responseData.data = doc;     //保存的是这篇文章的相关信息
				resolve(responseData)
			}

			if(err){
				reject(err);
			}
		})
	})
})

//进入内容详情页显示评论
api.post('/comment', async(ctx) => {
	var contentId = ctx.request.body.contentId;

	ctx.body = await new Promise(function(resolve, reject){
		Content.findOne({_id: contentId}).exec(function(err, doc){
			if(doc){		
				responseData.data = doc;  
				resolve(responseData)
			}

			if(err){
				reject(err);
			}
		})
	})
})

module.exports = api;