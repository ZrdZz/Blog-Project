var mongoose = require('mongoose');

//博客内容表结构
module.exports = new mongoose.Schema({
	//关联字段-内容分类id
	category: {
		//类型
		type: mongoose.Schema.Types.ObjectId,
		//引用
		ref: 'Category'
	},

	//标题
	title: String,

	//简介
	description: {
		type: String,
		default: ''
	},

	//时间
	addTime: {
		type: Date,
		default: Date.now
	},

	//阅读量
	views: {
		type: Number,
		default: 0
	},

	//关联字段-用户id
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},

	//内容
	content: {
		type: String,
		default: ''
	},

	//评论
	comments: {
		type: Array,
		default: []
	}
});