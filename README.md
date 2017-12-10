Blog-Project
a blog project based on nodejs

## 使用 koa2 + mongoose + ejs 做的博客系统

### 目录结构

- db              数据库文件
- schemas         用于定义数据库的结构
  - users.js
  - contents.js
  - categories.js
- models          由schema编译而成的构造器,可以对数据库进行增删查改,Model的每一个实例都是一个document
  - User.js
  - Category.js
  - Content.js
- public          存放静态文件
  - css
  - js
  - fonts
  - images
- routers         路由
  - main.js
  - api.js
  - admin.js
- views           模板文件
  - admin
  - main
- app.js          主文件

### 错误


1. `<a href="/admin/usermsg/?page=<%= page - 1 %>">上一页</a>`
   =前后不要乱加空格,会被转义
2. ctx.render渲染模板时,第二个参数传入的是`Object.assign({}, ctx.state || {}, model || {})`
   首先,`model || {}`确保即使传入`undefined`,传给View的参数也会默认为{}。
   `Object.assign()`会把除第一个参数外的其它参数的所有属性复制到第一个参数中
   `ctx.state || {}`能把一些公共变量放入`ctx.render`并传给View
   
注:通过`use()`来注册中间件，中间件会按照顺序执行，并会在匹配的路由的回调之前调用,对于不匹配的路由则不会调用,如果注册的路由少了`await next()`, 则之后的中间件以及被匹配的路由的回调就不会被调用(有时间把koa2和koa-router源码在研究一下)



每个请求都会创建一个ctx上下文,在这个请求的中间件中可以共享`ctx.state`

### koa2基础

#### 创建工程
```
const Koa = reqiure('koa');     //导入koa
const app = new Koa();          //创建一个koa对象

app.use(async(ctx, next) => {   //对于任何请求,app将调用该异步函数处理
  ...
  await next();
  ...
})

app.listen(3000);
```

上面的异步函数中的`await next()`用于将执行权传到下一个异步函数



#### koa middleware

koa把很多`async`函数组成处理链,当一个请求到来时,先执行第一个异步函数,遇到`await next()`时进入下一个异步函数,最后一个异步函数执行完后又会一层层执行上去,每个异步函数称为中间件,若有一个异步函数没有调用`await next()`,后续的中间件将不再执行。

执行顺序如下图:
![中间件执行图](http://upload-images.jianshu.io/upload_images/3663059-03622ea2a9ffce2a.jpg)

### 模板引擎的配置和使用

`koa-views`模板渲染中间件,支持很多种引擎,这次用`ejs`

#### API
`views(root, opts)`
- `root`: 模板文件存放的位置,必须是绝对路径,所有渲染的模板都是相对于这个路径
- `opts`: (optional)
- `opts.extension`: 模板文件默认的扩展,这样使用时就可以只写文件名
- `opts.map`: 制定一种文件扩展用什么引擎,`views(__dirname, {map: {html: 'nunjucks'}})`,`.html`结尾的文件使用`numjucks`模板引擎
- `opts.engineSource`: 不懂是什么意思。。
- `opts.options`: 也没看懂用在哪。。

示例:
```
const views = require('koa-views');

//必须被用在任何一个路由之前
app.use(views(__dirname + '/views', {extension: 'ejs'}))
app.use(async(ctx) => {
  let title = 'hello';
  //用在模板中的一些通用参数可以放在`ctx.state`对象中,默认会传递给模板,若要传一些非通用的可以放在`render`函数的第二个参数中
  await ctx.render('index', {title});    
})
```

### 静态资源加载

`koa-static`

示例:
```
const static = require('koa-static');

app.use(static(__dirname + '/public'));
```

### 路由

`koa-router`

示例:
```
//app.js
const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

router.use('/', main.routes(), main.allowedMethods());
router.use('/admin', admin.routes(), admin.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());

//main.js
const Router = require('koa-router');
const main = new Router();

main.get(...)
    .post(...);


//admin.js
const Router = require('koa-router');
const admin = new Router();

admin.get(...)
    .post(...);
```

### POST请求处理

对于post请求,`koa-bodyparser`可以将数据解析到`ctx.request.body`中
```
const body = require('koa-bodyparser');
app.use(body());
```

### 用户注册

页面一打开显示的是登录界面,若无账号点击'马上注册',则会切换到注册界面,这个实现简单,绑定一个点击事件,显示一个隐藏另一个就好了。

***

fetch基础

fetch是基于Promise设计的

示例:
```
fetch('flowers.jpg')    
    .then(function(response) {
      return response.blob();
    })
    .then(function(myBlob) {
      var objectURL = URL.createObjectURL(myBlob);
      myImage.src = objectURL;
    });
```
第一个参数为请求地址,然后会返回一个包含`response`(Response对象)的`promise`的对象,他只是一个`http`响应,并不是一个图片,为了获取图片的内容,需要使用`blob()`方法。
`blob()`方法在`body mixin`中定义,还有其他方法用于获取其他类型的内容,如`json()`、`text()`、`formData()`

第二个参数可选,是一个可以控制不同配置的对象
- `method`：请求使用的方法
- `headers`: 请求的头信息
- `body`: 请求的body信息,注意`get`、`head`方法的请求不能包含body信息
- `mode`: 请求的模式,通过设置这个可以在发起请求阶段就阻止跨域请求,有`same-origin`、`no-cors`、`cors`、`navigate`[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Request/mode)
- `credentials`: 控制请求是否带上`cookie`等信息
   1. `omit`: 请求不带`cookie`
   2. `same-origin`: 同域请求会带`cookie`
   3. `include`: 都会带上`cookie`
- `cache`: 请求的`cache`模式,详情[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache)
- `redirect`: 设置请求如果遇到重定向的返回如何响应[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalFetch/fetch)
   1. `follow`: 跟随重定向
   2. `error`: 若响应式重定向则报错
   3. `manual`: 手动处理重定向
- `referrer`: 设置请求的`referrer`字段的值
- `referrerPolicy`: 设置referer HTTP header
- `integrity`： 设置请求的subresource integrity

注意: 
- 当接收到一个代表错误的 HTTP 状态码时,从`fetch()`返回的`Promise`不会被标记为`reject`,即使该HTTP响应的状态码是404或500。它会将`Promise`状态标记为
  `resolve`(但是会将resolve的返回值的`ok`属性设置为false),仅当网络故障时或请求被阻止时,才会标记为`reject`
- 默认情况下,`fetch`不会从服务端发送或接收任何`cookie`,如果站点依赖于用户`session`,则会导致未经认证的请求(要发送`cookies`,必须设置`credentials`选
  项)
***

注册账号时,通过fetch提交数据到后台
```
var data = {
    username: registerBox.querySelector('input[name="username"]').value,
    password: registerBox.querySelector('input[name="password"]').value,
    repassword: registerBox.querySelector('input[name="repassword"]').value
}

var myInit = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {'Content-Type': 'application/json'}
}

fetch('/api/user/register', myInit)
    .then(function(res){  
	return res.json();
    })
    .then(function(obj){
        document.getElementById('registerInfo').innerHTML = obj.message;
    })
```

后端接收到数据后先验证一些账号密码等,再检查数据库中是否有记录,若没有则保存到数据库中。

```
api.post('/user/register', async(ctx) => {
    var username = ctx.request.body.username,
	password = ctx.request.body.password,
	repassword = ctx.request.body.repassword;
	
    ...一些验证...

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
```

### 用户登录

通过fetch将账号密码提交到后端
```
var data = {
	username: loginBox.querySelector('input[name="username"]').value,
	password: loginBox.querySelector('input[name="password"]').value
}
var myInit = {
	method: 'POST',
	body: JSON.stringify(data),
	headers: {'Content-Type': 'application/json'},
	credentials: 'include'      
}

fetch('/api/user/login', myInit)
	.then(function(res){  
	     return res.json(); 
	})
        .then(function(obj){
             if(obj.code === 0){
                //userBox.style.display = "block";
                //loginBox.style.display = "none";
		// document.getElementById('username').innerHTML = obj.userMsg.username;
		
		//登录成功后刷新页面,从cookie中取得信息,通过在模板中判断信息是否存在显示不同的部分
		window.location.reload();
	     }else{
		document.getElementById('loginInfo').innerHTML = obj.message;
	     }	
	})
```

后端接收到数据后先做一个简单的验证,然后在数据库中查询,并保存到cookie中
```
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

    //查询数据库中用户名或密码是否存在,若存在则登陆成功,并保存到cookie中
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
```
### 博客后台管理

博客后台管理代码都类似,全是一些数据库的增删查改操作。

比如给博客添加分类:

通过表单提交分类名称,后台接受到以后先检查是否有名称传送过来,然后检查数据库是否有同名,若没有则保存到数据库。

```
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
```

展示博客分类的页面:

注意分页的处理,当前页面数不能大于总页面数,也不能小于1。通过数据库查找到数据后传给模板,然后通过循环渲染出来。

```
admin.get('/category', async(ctx) => {
    var categoryMsg = ctx.state.categoryMsg;
    categoryMsg.pages = Math.ceil(categoryMsg.categoryCount / categoryMsg.limit);
    categoryMsg.page = categoryMsg.page > categoryMsg.pages ? categoryMsg.pages : categoryMsg.page;   //page不能大于pages,不能小于1
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
```


















   






