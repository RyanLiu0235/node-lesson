# lesson05-利用express搭建MVC结构的应用

## 本章节涉及知识点

* `express`——Fast, unopinionated, minimalist web framework for node.（快速、开放、抽象的nodejs网页框架）。其实就是TJ打造的`connect`升级版，更完善的功能，对web应用更全面的支持，以及其实各种好处多多。本来TJ觉得`connect`只是一个工具，用来给其他的工具引用而不是直接应用到应用里的。他的设想是`express`来作为一个web应用的框架。

## 本章节目标

熟悉`express`，利用`express`来搭建一个MVC结构的web应用

## 实现过程

#### 安装`express`

不过这里我们直接安装`express 生成器`，他可以帮我们很快地构建一个express应用的基本框架

```
$ sudo npm install express-generator -g
```

如此，我们全局安装了`express 生成器`。注意，当我们要全局安装某一个东西的时候，最好使用sudo，因为会涉及到某些路径的写入权限。接下来，我们利用这个工具来生成一个express应用：

```
$ express myapp

   create : myapp
   create : myapp/package.json
   create : myapp/app.js
   create : myapp/public
   create : myapp/routes
   create : myapp/routes/index.js
   create : myapp/routes/users.js
   create : myapp/public/images
   create : myapp/views
   create : myapp/views/index.jade
   create : myapp/views/layout.jade
   create : myapp/views/error.jade
   create : myapp/public/stylesheets
   create : myapp/public/stylesheets/style.css
   create : myapp/bin
   create : myapp/bin/www

   install dependencies:
     $ cd myapp && npm install

   run the app:
     $ DEBUG=myapp:* npm start

   create : myapp/public/javascripts

```
我们可以看到，现在`/lesson05-利用express搭建MVC结构的应用`的目录下已经多了一个`myapp`的文件夹，打开可以发现express已经给我们自动生成了很多文件，这在命令行里也可以看到。好了废话不多说，我们直接`cd`到目录下面然后安装`package.json`里面的依赖包。

```
$ cd myapp && npm install
```
这时候我们的`myapp`目录下就多了一个`/node_modules`文件夹，里面都是我们需要的依赖包。

好了，按照上面命令行里的提示，运行我们的express应用

```
$ npm start

> myapp@0.0.0 start /我的目录/node-lesson/lesson05-利用express搭建MVC结构的应用/myapp
> node ./bin/www

```
然后打开[http://localhost:3000/](http://localhost:3000)，注意看报错里面有没有提示你端口被占用了(`Port 3000 is already in use`)，如果3000端口被占用，我们需要修改`/bin/www`文件里面的端口：
```javascript

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
```
将端口修改为别的，再重新运行，OK，我们的express应用就初步完成了。

**一点题外话**

我们搭建网站的时候需要不断修改应用的后台文件，所以还是建议大家使用`nodemon`来运行项目。

将`package.json`文件中的
```javascript
"start": "node ./bin/www"
```
改成
```javascript
"start": "nodemon ./bin/www"
```

**回归正题**

#### MVC框架

MVC——模型、视图、控制器。

模型就是负责数据的那一部分、视图就是负责数据的显示、控制器就是负责从视图读取数据，控制用户输入，并向模型发送数据。

好了，我们来一一对应express。

我们可以看到，在现有的目录结构下，有一个`views`文件夹，还有一个`routes`文件夹。我们可以初步认为，`views`文件夹下面装的就是视图模板，`routes`文件夹下面装的就是控制器。现有的目录里没有涉及到数据库，所以我们也暂时不涉及到数据库。


#### express是如何工作的

我们现在来看一下`express`是如何工作的——也就是一个请求从发出到响应，在`express`里到底走了哪几步。

首先，我们运行了`/bin/www`文件，这个文件引入了`app.js`，我们看到`app.js`就是定义了很多中间件的使用。而`/bin/www`文件则主要是运行了一个服务器。

我们可以看到在`app.js`里面，他有定义两个中间件的使用：
```javascript
app.use('/', routes);
app.use('/users', users);
```
意思就是'/'请求就交给`routes`中间件来处理，'/users'请求就交给`users`中间件来处理。

然后我们往下看。下面有三个中间件的定义，分别是`捕捉404错误`，`开发环境捕捉500错误`，`生产环境捕捉500错误`。什么意思呢？也就是说当路由请求无法匹配上面`routes`与`users`中间件，那么我们就把这个请求处理成404。如果网页出现错误，在生产环境中，我们不希望错误详情被用户看到，所以我们只是显示错误而不打印错误详情。而在开发环境中，我们希望错误被详细地打印出来。

这里，我们就将所有的路由请求分配到位了，然后我们继续看看请求的实现细节。我们看看`/routes/index.js`文件是怎么处理这个请求的。

```javascript
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
```
它暴露出去的，是一个`router对象`，它本质上是express的`Router()`对象，这里只是定义了一个'/'请求的处理中间件，他调用了`res`对象的`render`方法，使用数据`{ title: 'Express' }`来渲染`index`模板，至于这个`index`模板在哪里，其实就是`/views/index.jade`文件。

OK，我们再来看看`/views/index.jade`文件：

```jade
doctype html
  html
  head
    title= title
    link(rel='stylesheet', href='/stylesheets/style.css')
  body
    h1= title
    p Welcome to #{title}
```
我索性直接将完整的页面写了出来，方便讲解。

这里我希望大家先去看看[jade模板引擎的API](http://jade-lang.com/reference/)。我们可以看到这里有三个地方出现了`title`这个变量，而我们渲染的数据里面就有`title`这个字段。所以这样页面就渲染出来了。

至此，从请求的分配，到请求的处理（中间包含了很多地方，这里不多作展开），到模板的渲染，我们就基本上完成了一整个请求的周期。

如果你想详细了解如何利用express搭建一个MVC应用，比如说一个个人博客，建议你去参考这个项目，[N-blog](https://github.com/nswbmw/N-blog)，它在[wiki](https://github.com/nswbmw/N-blog/wiki)里详细讲解了搭建一个网站的各方面知识。

## TODO 

* 我们本节没有涉及到数据库的交互，在接下来的章节，我们将会利用`mongodb`以及工具`mongoose`来帮助我们存储数据。



[lesson06-创建一个本地静态文件服务器](../lesson06-创建一个本地静态文件服务器/README.md)

















