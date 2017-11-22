var mongoose = require('mongoose');

//用户的表结构
module.exports = new mongoose.Schema({
	username: String,
	password: String,

	//是否是管理员,默认为false
	isAdmin: {
		type: Boolean,
		default: false
	}
});