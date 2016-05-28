# lesson04-connect

## 本章节涉及知识点

* `connect`——Connect is an extensible HTTP server framework for node using "plugins" known as middleware。（Connect是一个为nodejs打造的使用一种名叫`中间件`的插件的可扩展的HTTP服务器框架。）`connect`是TJ编写的，一个基础的web框架。`connect`完成的事情其实很简单，就是连接中间件，当一个请求发送过来的时候，让这个请求依次流过这些符合条件的中间件，然后每个中间件会对这个请求做一定的处理，最后把它丢给下一个中间件。


## 本章节目标

熟悉`connect`，理解`中间件`的概念。

## 实现过程

#### 使用`connect`

我们利用`connect`要做的，就是自己写一些自定义的中间件来处理我们的请求。就这么简单。

首先下载

```
$ npm install connect --save
```

**一点题外话**

本节开始，我们要通过`npm`下载一些东西了，所以`npm`大家一定要会用了。在`package.json`里面的一些字段大家看着名字应该也能猜出来他们是什么意思了。
```
$ npm init
```

**回归正题**

好了，这时候我们的`package.json`下的`dependencies`字段就多了一些信息了。

#### hello world

我们来利用`connect`写一个将所有请求都处理为输出一段hello world的服务器

```javascript
var app = require('connect')();

app.use(function(req, res, next) {
	res.end('hello world');
}).listen(3100);
```

通过`use`，我们可以给请求定义一些中间件。例子里的
```javascript
function(req, res, next) {
	res.end('hello world');
};
```
大家可以理解成一个中间件。这个中间件是我们自定义的。由于前面没有定义路径，所以所有的请求都会流经此中间件。也就是不管你在浏览器的窗口里输入什么鬼东西，比如[http://localhost:3100/asdfas/asdf/asdf/asdf?asdfasdf=asdfasdf](http://localhost:3100/asdfas/asdf/asdf/asdf?asdfasdf=asdfasdf)，他都会处理成一段输入，hello world。

#### 中间件

我们前面一直有提到一个概念，就是`中间件（middleware）`，这在`connect`以及其升级版`express`里都是一个很重要的概念。

所以我们就来说说`connect`的`中间件机制`。`connect`其实并不关心每个请求（不管是什么类型的——get，post，delete。或者是什么内容——各种参数各种路径。），它只是实现了一种机制，将你定义的、引用的所有中间件都放入一个`栈`，然后让你的请求你依次流过符合条件的中间件——所谓的符合条件就是`use`关键字后面的第一个参数，`connect`规定如果第一个参数缺省的话就默认为所有请求。具体的处理过程交给中间件去处理。每个处理`正常逻辑`的中间件会接受三个参数，`req`，`res`，`next`。第一个是包含请求信息的一个可读流，第二个是包含响应信息的可写流，第三个是代表将请求继续往下传的方法。如果一个中间件的最后调用了`next()`，那说明这个请求还得继续往下找符合条件的中间件来处理它。

我们来多写几个例子：

假设现在我们有这样一个需求。当请求'/index'的时候，我们返回输出'hello world'，当请求'/user'，时，我们返回输出'welcome here'。

```javascript
var app = require('connect')();

app.use('/index', function(req, res, next) {
	res.end('hello world');
});
app.use('/user', function(req, res, next) {
	res.end('welcome here');
});

app.listen(3100);
```

如上。

我们说过，在实际情况中，`req`里通常会包含了请求信息，例如session或者cookie的信息，或者`url`等等字段。那么我们可以在第一个中间件里做一个session判断，判断用户是否登录。如果用户在登录之后发起这个请求，那么req里面就应该有session的信息。当然，我们这里没有引入session处理的中间件，也没有登录，我们不费神去硬编码一些session信息了。我们就判断请求的类型`method`字段，如果是`get`请求，我们就调用下一个中间件来处理它，如果不是我们就终止这个请求并返回一个输出'you\'re not allowed to visit'。

代码改写如下：

```javascript
var app = require('connect')();

app.use('/index', function(req, res, next) {
	if (req.method.trim().toLowerCase() === 'get') {
		next();
	} else {
		res.end('you\'re not allowed to visit');
	}
});

app.use('/index', function(req, res, next) {
	res.end('hello world');
});

app.use('/user', function(req, res, next) {
	res.end('welcome here');
});

app.listen(3100);
```

好了。这里我就不过多介绍如何发起一个post请求了。大家可以试试Postman或者自己另外在一个网页上使用ajax发起一个post，看看返回的是hello world还是you\'re not allowed to visit。

其实我们常常会对一个请求安排多个中间件来处理，主要是因为我们希望将中间件的处理逻辑模块化，每个中间件只做一件事情，比如有的中间件只处理session相关的事情，有的中间件只做验证登录，有的中间件则只是处理请求里的一些字段。这样分工明确，保证一个中间只做并做好一件事，中间件之间没有或者少有耦合，这是中间件的一个非常大的特点。

nodejs拥有相当大的自带的或者第三方的依赖包——其实他们中的一部分提供的也就是一个中间件。

以下是一个叫`bodyParser`的包：

```javascript
var multipart = require('./multipart')
  , urlencoded = require('./urlencoded')
  , json = require('./json');

exports = module.exports = function bodyParser(options){
  var _urlencoded = urlencoded(options)
    , _multipart = multipart(options)
    , _json = json(options);

  return function bodyParser(req, res, next) {
    _json(req, res, function(err){
      if (err) return next(err);
      _urlencoded(req, res, function(err){
        if (err) return next(err);
        _multipart(req, res, next);
      });
    });
  }
};

```
它返回的是一个方法`bodyParser`，这个方法接受了三个参数。我们应该能够看出来，它其实也是一个中间件，所以我们引用它的时候也大概能够猜出来怎么用。
```javascript
var bodyParser = require('body-parser'),
	app = require('connect')();

app.use(bodyParser());
```
其实差不多就是以上这样了。大家可以多去看看一些其他的第三方依赖包，比如[connect-flash](https://github.com/jaredhanson/connect-flash/blob/master/lib/flash.js)，[cookie-parser](https://github.com/expressjs/cookie-parser/blob/master/index.js)。

当然，不是说要大家去看他的功能是如何实现的，而是去看他的代码结构。

很多这样的第三方插件的主文件结构一般就是：

```javascript
module.exports = someModule;

someModule = function(arg) {
	return function someModule (req, res, next) {
		// 这里是一些代码...

		next();
	}
}
```

中间在`someModule`里返回的那个方法就是一个中间件的结构。

想必大家对`中间件`的概念稍微有了一点了解。本节我们利用`connect`搭建了一个服务器，监听3100端口。并且做了三个中间件，分别处理请求'/index'，'/user'。同时，我们也理解了中间件的几个参数的意义。`req`是包含请求信息的一个可读流，`res`是包含响应信息的可写流，`next`是代表将请求继续往下传的方法。如果一个中间件的最后调用了`next()`，那说明这个请求还得继续往下找符合条件的中间件来处理它。

#### 一些补充

* 上面我们说了，每个处理`正常逻辑`的中间件会接受三个参数`req`、`res`、`next`，其实还有一些`处理错误`的中间件，他们有四个参数，依次为`err`、`req`，`res`，`next`，第一个就是一个错误信息。




[lesson05-利用express搭建MVC结构的应用](../lesson05-利用express搭建MVC结构的应用/README.md)













