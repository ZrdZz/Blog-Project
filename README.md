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









   






