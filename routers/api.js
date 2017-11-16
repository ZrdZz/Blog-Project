const Router = require('koa-router');
const User = require('../models/User.js');

const api = new Router();

/*
 * 1. 用户名、密码不能为空
 * 2. 两次密码输入必须一致
 * 3. 数据库查询用户是否被注册
 */

 //统一数据格式
var responseData = {
	code: 0,
	message: ''
};

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
	await new Promise(function(resolve, reject){
		User.findOne({'username': username}, function(err, doc){
			if(doc){
	 			//表示数据库中有纪录
	 			responseData.code = 4;
	 			responseData.message = '用户名已被注册';
	 			resolve(responseData);				
			}else{
				//保存用户消息到数据库
				var user = new User({'username': username, 'password': password});
				user.save();
				responseData.code = 0;
	 			responseData.message = '注册成功';
	 			resolve(responseData);				
			};

			if(err){
				reject(err);
			}
		})
	})
});

module.exports = api;