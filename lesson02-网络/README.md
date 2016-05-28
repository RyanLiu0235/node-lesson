# lesson02-网络

## 本章节涉及知识点

* `http`，`https`模块——本节主要讲`http`模块。`http`是一个用来进行传送内容和应用程序的应用层协议，它将TCP用作传输协议。关于什么是`http`这里不多做阐述，我们直接show some code。本节涉及到的是如何用`http`来搭建一个服务器，并且处理请求。


## 本章节目标

搭建一个静态文件的http服务器

## 实现过程

#### hello world

首先，我们还是写一个烂大街的例子，hello world——不过这次是http服务器版本的。

```javascript
var server = require('http').createServer();

server.on('request', function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('hello world!');
});

server.listen(3100, function() {
	console.log('server is listening on port 3100');
});
```
可见，只要我们引用了`http`模块，并且调用`createServer()`方法，我们就能得到一个服务器对象。

我们事先说过，nodejs是基于事件触发机制的一个JavaScript运行环境。从上一节我们也看到了，可读流可写流分别监听了各种事件，本节中，服务器对象监听了`request事件`——`request事件`就是一次请求。也就是说，如果发生了对这个服务器的请求，那么就执行给这个事件绑定的回调函数。我们这里声明的是一个匿名的回调函数，并且接受两个参数`req`，`res`。前者是包含了请求信息的一个对象，是一个可读流。后者是响应对象，用来响应客户端，是一个可写流——这里我希望各位能想到前一节学到的`pipe`方法，也就是

```javascript
readStream.pipe(writeStream)
```

该方法能自动控制流量以避免目标被快速读取的可读流所淹没。

回调函数里面的两句话分别向响应对象写入了响应头以及响应主体，也就是hello world。

最后，调用listen方法，监听3100端口。

这时候我们执行shell命令

```
$ node app.js
server is listening on port 3100
```

打开[http://localhost:3100/](http://localhost:3100/)，看看是不是在网页上显示了hello world的文本。

#### 搭建静态文件服务器

现在我们已经能够利用`http`模块搭建服务器了。我们利用前一节学到的`fs`模块来搭建一个静态文件服务器。当正确输入服务器下的文件路径时候，我们就把文件显示在网页上。事实上，不管是各种文本还是音频视频，我们都能照样输出的。

**一点题外话**

想必大家学习到现在也体会到了，每次修改app.js都必须重启服务器才能生效。这里建议大家全局安装一个node_module，`nodemon`，这个可以自动监测文件的修改并自动重启服务器，省去了我们很多麻烦。

```
$ sudo npm install -g nodemon
```
这以后我们的命令就变成了
```
$ nodemon app.js
```

然而，我们既然想规范就索性再走一步。大家在安装nodejs的时候，系统已经自动安装了`npm`了。这是nodejs的包管理工具，可以帮助我们安装nodejs的依赖包。我们新建一个`package.json`。

```
$ npm init
```

这时候会出现很多选项，如果你不是很清楚这些东西，那就直接回车一路按到底，最后输入yes确认。这时候打开项目目录，会看到多了一个文件`package.json`，我们在`scripts`字段下面多加一条

```javascript
"start": "nodemon app.js"
```

保存，然后退出服务器，在终端里重新输入另一个命令：

```
$ npm start
```

你会发现这个命令的功能跟我们需要的`nodemon app.js`是一样的。这个功能在`express`中也是默认使用了的。

**回归正题**

明白了需求之后，我们再来考量需要怎么写代码。

首先，我们还是得搭建一个服务器。

```javascript
var server = require('http').createServer();

server.on('request', function(req, res){
	// 这里是代码
});
server.listen('3100', function() {
	console.log('服务器运行在 3100 端口');
});
```
接下来，我们需要处理请求，分别会出现以下几种情况：
* 输入的地址我们找不到——对应http状态码就是404
* 输入的地址是一个目录而不是一个资源，这时候我们不做更加深入的处理，我们只是将它认为是不能访问——对应http状态码就是403
* 输入的地址是我们要找到的资源——对应的http状态码就是200

然后我们开始编写我们的代码

```javascript
var server = require('http').createServer(),
	path = require('path'),
	fs = require('fs');

server.on('request', function(req, res){
	// 获取并且规范化输入的地址
	var _url = path.normalize('.' + req.url);

	// 查看这个地址是否存在
	fs.exists(_url, function(exist) {
		if (exist) {
			// 地址存在
			fs.stat(_url, function(err, stat) {
				if (err) {
					// 找不到资源
					console.error(err);
					res.writeHead(500);
					res.end('网络错误', 'utf8');
				}

				if (stat.isDirectory()) {
					// 路径是一个目录
					res.writeHead(403);
					res.end('禁止访问', 'utf8');
				} 
				else {
					// 如果地址输入无误
					var readStream = fs.createReadStream(_url);
					res.writeHead(200);
					readStream.pipe(res);
				} 
			});
		} else {
			// 如果地址不存在
			res.writeHead(404);
			res.end('输入地址有误', 'utf8');
		}
	});
});
server.listen('3100', function() {
	console.log('服务器运行在 3100 端口');
});
```
这里我们使用了`fs`模块的两个方法，相信大家对这些API一目了然，`fs.exists()`方法用于检查路径是否存在，`fs.stat()`方法用于查看文件信息。

在“输入地址无误”的情况下，我们创建了一个可读流readStream，同时向响应对象res里输入数据。这样可以保证数据完整地传输到可写流。

这时候大家可以在命令行里输入命令开启服务器了：

```
$ npm start

> lesson02@1.0.0 start /%$#$^%^%$&/node-lesson/lesson02-网络
> nodemon app.js

[nodemon] 1.9.2
[nodemon] to restart at any time, enter `rs`
[nodemon] watching: *.*
[nodemon] starting `node app.js`
服务器运行在 3100 端口
```

然后我们找几个流媒体文件放在目录下面，我找了一个mp3文件。这时候我们在浏览器里输入[http://localhost:3100/flower.mp3](http://localhost:3100/flower.mp3)，看看能不能加载出音频文件。同样文本文件也是一样[http://localhost:3100/app.js](http://localhost:3100/app.js)

## TODO

* `net`模块——`net`可以用来创建一个TCP服务器。


[lesson03-进程管理](../lesson03-进程管理/README.md)









