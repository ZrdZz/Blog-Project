Blog-Project
a blog project based on nodejs

## 使用 koa2 + mongoose + ejs 做的博客系统

### 目录结构

- db                  数据库文件
- schemas             用于定义数据库的结构
  - users.js
- models              由schema编译而成的构造器,具有抽象属性和行为,可以对数据库进行增删查改,Model的每一个实例都是一个document
  - User.js
- public              存放静态文件
  - css
  - js
  - fonts
  - images
- routers             路由
  - main.js
  - api.js
  - admin.js
- views               模板文件
  - admin
  - main
- app.js              主文件

### 错误

1. `<a href="/admin/usermsg/?page=<%= page - 1 %>">上一页</a>`
   =前后不要乱加空格,会被转义
2. ctx.render渲染模板时,第二个参数传入的是`Object.assign({}, ctx.state || {}, model || {})`
   首先,`model || {}`确保即使传入`undefined`,传给View的参数也会默认为{}。
   `Object.assign()`会把除第一个参数外的其它参数的所有属性复制到第一个参数中
   `ctx.state || {}`能把一些公共变量放入`ctx.render`并传给View
   #### 注:只有use()中的ctx.state可以共享
   






