# lesson06-创建一个本地静态文件服务器

## 本章节涉及知识点

* `connect`——用来搭建本地服务器。
* `os`——用来获取一些基本的操作系统相关信息。
* `child_process`——用来创建一个子进程来开启一个页面。

## 本章节目标

本章节作为前面几节的复习总结，仿照朴灵的工具[anywhere](https://github.com/JacksonTian/anywhere)来编写一个静态文件服务器。

## 实现过程

首先我们来看看朴灵的这个工具从使用者的角度出发，它实现了什么功能。

> 随时随地将你的当前目录变成一个静态文件服务器的根目录。

而我们使用起来就是在目录下运行`anywhere`，然后就弹出一个页面，页面上将当前目录的所有文件夹、文件都列出来了。

OK，那么首先我们需要一个本地服务器。

```javascript
var connect = require('connect');
var app = connect();

app.listen(3200);
```

然后我们需要将本地的文件以及文件夹都显示出来，这时候我们需要一个包，叫`serve-index`，这个包是做什么的呢？

> Serves pages that contain directory listings for a given path.

也就是将所给地址的资源都列出来。

大致的一个demo

```javascript
var serveIndex = require('serve-index');
var app = require('connect')();

app.use(serveIndex(process.cwd(), {"icons": true})).listen(3300);
```
这个接受两个参数，第一个参数是地址（`process.cwd()`方法返回进程当前的工作目录），第二个参数是一些选项（本例中`icons`字段代表列出来的资源都是有图标的，比如说文件夹就对应文件夹图标），具体[就看这里](https://github.com/expressjs/serve-index)。

这样，我们打开[http://localhost:3300/](http://localhost:3300/)，就能看到路径下面的所有资源都被列出来了。

好了，其实就这三段代码，我们已经实现了我们要的基本功能了。接下来要做的，都是完善用户体验与实现跨平台兼容的代码了。

首先，我们想它能自动为我们打开网页。这时候，我们需要另外开启一个进程，用来打开一个网页。

`child_process`能为我们打开一个子进程，好了，我们来做一下。

```javascript
var serveIndex = require('serve-index'),
    exec = require('child_process').exec,
    app = require('connect')();

app.use(serveIndex(process.cwd(), {"icons": true})).listen(3300, function() {
	exec('open ' + 'http://localhost:3300');
});
```

这里，[child_process](http://nodeapi.ucdok.com/#/api/child_process.html)的API里有介绍`exec`，其实我们用`spawn`也是可以的。只是`spawn`的写法比较复杂，我们就还是用了`exec`。

大家可以把这个理解成另外开了一个终端窗口，执行了一条命令。因为我们传给`exec`的也就是一条可以在终端里运行的命令，大家可以自己另外建一个文件，用`child_process`来执行一条终端命令。比如说：

```javascript
var cp = require('child_process').exec;

cp('touch demo.txt');
```
运行以上命令，我们应该可以在当前路径下得到一个新的文件'demo.txt'；

回到正题，我们知道了`child_process`可以新开一个进程，完成一些指令。当然，我们也可以在执行命令的时候传一些参数进去，做一些个性化设置。这里就不多做介绍。

然后我们做一下跨平台的兼容，这里由于机器所限，我就直接照搬朴灵大神的代码了。

```javascript
var serveIndex = require('serve-index'),
	os = require('os'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    app = require('connect')();

// 打开浏览器窗口
function openUrl(url) {
	switch (os.platform()) {
		case 'darwin':
			exec('open ' + url);
			break;
		case 'win32':
			exec('start ' + url);
			break;
		default:
			spawn('xdg-open ', [url]);
	}
}
app.use(serveIndex(process.cwd(), {"icons": true})).listen(3300, function() {
	openUrl('http://localhost:3300');
	console.log('server is running at http://%s:%s', 'localhost', 3300);
});
```

`os`模块用来获取一些基本的操作系统相关信息，具体请查看[os模块API](http://nodeapi.ucdok.com/#/api/os.html)。这里我们用它获取了本机的平台信息，`darwin`对应的是mac机器，`win32`对应的是windows系统，其他的就是`linux`或者其他平台的机器了。

**题外话**

其实建议大家不是很懂的地方，不管是nodejs本身的API还是各种模块，都去找一找对应的API或者去github上找一找它的项目，写一个小的例子就能知道它到底是干嘛的了。

**回归正题**

接下来，我们不想它每次打开的hostname都是localhost，至少得是一个IP地址。

```javascript
var serveIndex = require('serve-index'),
	os = require('os'),
    exec = require('child_process').exec,
    app = require('connect')();

// 获取本机IP地址
function getIpAddress() {
    var info = os.networkInterfaces();
    var address, dev;
    for (dev in info) {
        info[dev].forEach(function(v, i) {
            if (!!v.family && v.family === 'IPv4' && !v.internal) {
                address = v.address;
                return;
            }
        });
    }
    return address || '127.0.0.1';
}


// 打开浏览器窗口
function openUrl(url) {
	switch (os.platform()) {
		case 'darwin':
			exec('open ' + url);
			break;
		case 'win32':
			exec('start ' + url);
			break;
		default:
			spawn('xdg-open ', [url]);
	}
}

var hostname = getIpAddress();
var port = 3300;

app.use(serveIndex(process.cwd(), {"icons": true})).listen(port, function() {
	openUrl('http://' + hostname + ':' + port);
	console.log('server is running at http://%s:%s', hostname, port);
});
```

跑一下，结果也是妥妥儿的，现在打开的网页已经是本机的IP地址了。

写到这里我们已经完成了大部分工作，剩下的我们还有一件事要做，就是让用户自定义一些选项。

首先，`端口号`、`是否默认开启网页`以及`服务器根目录`要能够自定义，我们先加进去。

```javascript
var serveIndex = require('serve-index'),
	os = require('os'),
    argv = require('minimist')(process.argv.slice(2)),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    app = require('connect')();

// 获取帮助命令
if (argv.help) {
	console.info('Usage: ');
	console.info('node app.js --help // print all help info');
	console.info('node app.js // open with default port 8000');
	console.info('node app.js --port=3000 // open with port 3000');
	console.info('node app.js --dir="/User/XXX/XXX/XXXX/" // open with dir "/User/XXX/XXX/XXXX/"');
	console.info('node app.js --silent=true // not open automatically');
	process.exit(0);
}


// 获取本机IP地址
function getIpAddress() {
    var info = os.networkInterfaces();
    var address, dev;
    for (dev in info) {
        info[dev].forEach(function(i, v) {
            if (!!i.family && i.family === 'IPv4' && !i.internal) {
                address = i.address;
                return;
            }
        });
    }
    return address || '127.0.0.1';
}


// 打开浏览器窗口
function openUrl(url) {
	switch (os.platform()) {
		case 'darwin':
			exec('open ' + url);
			break;
		case 'win32':
			exec('start ' + url);
			break;
		default:
			spawn('xdg-open ', [url]);
	}
}

var hostname = getIpAddress();
var port = 3300;
var path = argv.dir || process.cwd();

app.use(serveIndex(path, {"icons": true})).listen(port, function() {
	if (!argv.silent) {
		openUrl('http://' + hostname + ':' + port);
	}
	console.log('server is running at http://%s:%s', hostname, port);
});
```

我们加了一些逻辑，让自定义的选项起到作用。

最后，我们希望每一次打开一个页面的时候都能自动打开当前页面的`index.html`，所以我们加入最后一个包`serve-static`。

```javascript
var serveIndex = require('serve-index'),
	serveStatic = require('serve-static'),
	os = require('os'),
    argv = require('minimist')(process.argv.slice(2)),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    app = require('connect')();

// 获取帮助命令
if (argv.help) {
	console.info('Usage: ');
	console.info('node app.js --help // print all help info');
	console.info('node app.js // open with default port 8000');
	console.info('node app.js --port=3000 // open with port 3000');
	console.info('node app.js --dir="/User/XXX/XXX/XXXX/" // open with dir "/User/XXX/XXX/XXXX/"');
	console.info('node app.js --silent=true // not open automatically');
	process.exit(0);
}


// 获取本机IP地址
function getIpAddress() {
    var info = os.networkInterfaces();
    var address, dev;
    for (dev in info) {
        info[dev].forEach(function(i, v) {
            if (!!i.family && i.family === 'IPv4' && !i.internal) {
                address = i.address;
                return;
            }
        });
    }
    return address || '127.0.0.1';
}


// 打开浏览器窗口
function openUrl(url) {
	switch (os.platform()) {
		case 'darwin':
			exec('open ' + url);
			break;
		case 'win32':
			exec('start ' + url);
			break;
		default:
			spawn('xdg-open ', [url]);
	}
}

var hostname = getIpAddress();
var port = 3300;
var path = argv.dir || process.cwd();

app.use(serveStatic(path, {"index": ["index.html"]}));
app.use(serveIndex(path, {"icons": true})).listen(port, function() {
	if (!argv.silent) {
		openUrl('http://' + hostname + ':' + port);
	}
	console.log('server is running at http://%s:%s', hostname, port);
});
```

OK，至此大功告成。



* [第七章——数据库操作](../lesson07-数据库操作/README.md) [@Joejo](https://github.com/Joejo)



