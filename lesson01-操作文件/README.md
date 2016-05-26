# lesson01-操作文件

## 本章节涉及知识点

* `fs`文件系统模块——`fs`模块是nodejs专门负责操作文件的模块，全称FileSystem。[具体API请查看](http://nodeapi.ucdok.com/#/api/fs.html)
* `stream`流——`流`是一个比较抽象的概念，在`nodejs`很多地方都有流的实现。它分为`可读流`，`可写流`，`可读可写流`。比如一个`TCP连接`既是可读流，又是可写流，而Http连接则不同，一个`http request`对象是可读流，而`http response`对象则是可写流。这里初期不对`流`做过多的阐述。[具体API请查看](http://nodeapi.ucdok.com/#/api/stream.html)
* `process`进程——本章节不过多涉及，只是利用这个全局对象取命令行参数。[具体API请查看](http://nodeapi.ucdok.com/#/api/process.html)

## 本章节目标

拷贝文件

## 实现过程

#### 引入模块

首先我们引入需要的模块，这里要用到nodejs的一个函数`require`，`require`函数用于在当前模块中加载和使用别的模块，传入一个模块名，返回一个模块导出对象。模块名可使用相对路径（以./开头），或者是绝对路径（以/或C:之类的盘符开头）。另外，模块名中的.js扩展名可以省略。

好了废话不多说，我们引入第一个模块`fs`,

``` javascript
var fs = require('fs');
```

#### 获取命令行的参数

我们最终的命令是`$ node app.js ./a.zip ./b.zip`，第一个参数是`node`，第二个参数是要执行的文件`app.js`的路径，第三个参数是待拷贝的文件路径，可以是绝对路径也可以是相对路径，第四个参数是拷贝到的地址。

这里我们需要利用到一个全局变量`process`，`nodejs`的进程不是我们本章涉及到的重点，我们不多说，只是使用它的一个属性`argv`。`argv`是一个包含命令行参数的数组。第一个元素会是 'node'， 第二个元素将是 .Js 文件的名称。接下来的元素依次是命令行传入的参数。这恰好和我们之前在终端里输入的命令一样。

好了，我们现在用JavaScript数组的方法获取我们需要的参数

```javascript
var _argv = process.argv.slice(2);
```
对了，由于`process`是`nodejs`的全局属性，所以不需要require了。

#### 创建可读流可写流

传输文件的话，大家可以理解成把一定体积的水从一个桶运到另一个桶。事实上这是一个非常形象的比喻，因为`nodejs`里流的很多概念可以用这个比喻来解释。比如说我们待会儿要用到的`pipe`，就是一个管道的概念。

OK，我们来创建这两个流。

```javascript
var filePath = _argv[0];

var readStream = fs.createReadStream(filePath); // 创建一个可读流
var writeStream = fs.createWriteStream(_argv[1]); // 创建一个可写流
```
如此，我们顺利创建了一个可读流`readStream`，一个可写流`writeStream`。前者负责读取数据，后者负责写入数据。不理解的话也没事，我们继续。

#### 传输数据

创建了流之后，我们可以开始传输数据了。这里我不打算一步一步写如何最简单地传输数据，我们直接从事件来写。先贴代码。

```javascript
// 可读流触发'data'事件——有数据流入
readStream.on('data', function(chunk) {
    if (writeStream.write(chunk) === false) {
        readStream.pause(); // 数据暂停流动
    }
});

// 可读流触发'end'事件——数据传输结束
readStream.on('end', function() {
    writeStream.end(); // 数据终止流动
});

// 可写流触发'drain'事件——表明数据可以继续写入
writeStream.on('drain', function() {
    readStream.resume(); // 数据重新流动
});
```
上面的代码中`readStream`监测了两个事件`data`，`end`，分别为`数据流入事件`、`数据传输结束事件`。
当数据传入的时候（data事件），我们看到回调函数有一个参数`chunk`。

首先，我们之所以将一个很大的数据（例如2GB）分阶段地传输，就是为了防止爆仓，也就是数据还没有完全写入就又有新的数据传过来了，这时候很明显会导致数据的丢失。这取决于磁盘的IO性能。

单词chunk的意思就是'很大的一块'。每次触发`data`事件，我们都会在其回调函数里接收到一个参数，这个参数我们可以理解成本次流入的数据块。在回调函数里面，可写流写入数据，可写流的`write`方法返回的是一个状态，`false`就是写入没有完成的状态，这时候如果你继续传入数据，就会导致这部分数据丢失。我们不建议这么做。

可写流会监测`drain`事件，也就是当数据可以继续写入的时候，可读流就开始继续读取。

#### 跑一下试试

感觉已经写得差不多了。我们来试一下。

我们还是先贴出完整的代码

```javascript
var fs = require('fs'),
    _argv = process.argv.slice(2); // 获取命令行参数

var filePath = _argv[0];

var readStream = fs.createReadStream(filePath); // 创建一个可读流
var writeStream = fs.createWriteStream(_argv[1]); // 创建一个可写流

// 可读流触发'data'事件——有数据流入
readStream.on('data', function(chunk) {
    if (writeStream.write(chunk) === false) {
        readStream.pause(); // 数据暂停流动
    }
});

// 可读流触发'end'事件——数据传输结束
readStream.on('end', function() {
    writeStream.end(); // 数据终止流动
});

// 可写流触发'drain'事件——表明数据可以继续写入
writeStream.on('drain', function() {
    readStream.resume(); // 数据重新流动
});
```
打开命令行，cd到`app.js`的路径下，在路径下面放一个大文件（最好几个GB的）。放在别的文件夹可能会因为访问权限问题而出错。
```shell
$ node app.js ./a.zip ./b.zip
```
过个几秒钟，看看你的当前文件夹下面是否有一个b.zip，然后打开看看内容是不是都在，大小是否一致。

OK，这个时候我们的功能就算实现了。利用nodejs实现了一个文件的拷贝。

#### 获取文件信息

此时，我们已经完成了文件拷贝的功能，但是我们还想把事情做得更加详细。所以我们还需要获取文件的各种信息。

```javascript
var stat = fs.statSync(filePath); // 获取文件信息
var totalSize = stat.size / (Math.pow(1024, 3)); // 文件大小
```

`fs.statSync`方法就是异步地获取文件的信息。我们可以把这个stat打印出来看一下。

```
{ dev: 16777220,
  mode: 33279,
  nlink: 1,
  uid: 501,
  gid: 20,
  rdev: 0,
  blksize: 4096,
  ino: 19007964,
  size: 2313691464,
  blocks: 4518936,
  atime: Wed May 25 2016 12:57:05 GMT+0800 (CST),
  mtime: Thu Jan 14 2016 10:32:30 GMT+0800 (CST),
  ctime: Wed May 25 2016 10:51:59 GMT+0800 (CST),
  birthtime: Thu Jan 14 2016 10:31:21 GMT+0800 (CST) }
```
可以看到里面包含了很多信息，我们需要的就是文件的大小，这个是以byte为单位的所以我们还是需要处理一下将之变为GB为单位的。

好了，我们最终的代码就是如下

```javascript
var fs = require('fs'),
    _argv = process.argv.slice(2); // 获取命令行参数

var filePath = _argv[0];

var readStream = fs.createReadStream(filePath); // 创建一个可读流
var writeStream = fs.createWriteStream(_argv[1]); // 创建一个可写流

var stat = fs.statSync(filePath); // 获取文件信息
var totalSize = stat.size / (Math.pow(1024, 3)); // 文件大小
console.time('传输耗时');

// 事件触发写法
// 可读流触发'data'事件——有数据流入
readStream.on('data', function(chunk) {
    if (writeStream.write(chunk) === false) {
        readStream.pause(); // 数据暂停流动
    }
});

// 可读流触发'end'事件——数据传输结束
readStream.on('end', function() {
    console.timeEnd('传输耗时');
    console.info('数据传输结束，总共 %s GB', totalSize.toFixed(2));
    writeStream.end(); // 数据终止流动
});

// 可写流触发'drain'事件——表明数据可以继续写入
writeStream.on('drain', function() {
    readStream.resume(); // 数据重新流动
});
```
最终打印结果

```
$ node app.js ./a.zip ./b.zip
传输耗时: 5033ms
数据传输结束，总共 2.15 GB
```
可以看到，传输耗时以及数据的总体积我们已经打印出来了。当然，我们也可以使用一个setInterval函数来持续地打印已经传输的文件的大小。大家可以自己下去捣鼓。

**以上内容很大程度上参考了[`昔我往矣，杨柳依依。`的一篇文章](https://segmentfault.com/a/1190000000519006)，大家可以自己去看看。**

## pipe

以上我们使用了事件的方式来编写了拷贝的方法，当然，nodejs流还有一个方法`pipe`能够更加简洁地实现以上功能。我们将代码改写如下：

```javascript
var fs = require('fs'),
    _argv = process.argv.slice(2); // 获取命令行参数

var filePath = _argv[0];

var readStream = fs.createReadStream(filePath); // 创建一个可读流
var writeStream = fs.createWriteStream(_argv[1]); // 创建一个可写流

var stat = fs.statSync(filePath); // 获取文件信息
var totalSize = stat.size / (Math.pow(1024, 3)); // 文件大小
console.time('传输耗时');

readStream.pipe(writeStream, {end: false});
readStream.on('end', function() {
	console.timeEnd('传输耗时');
	console.info('数据传输结束，总共 %s GB', totalSize.toFixed(2));
});
```
`pipe`大致上就是一个管道的概念。还是拿水桶的比喻来解释。现在有两个桶，要将水从一个桶转移到另外一个桶，这时候我们需要一个管道连接两个桶，`pipe`就是这样一个管道。这个需要大家仔细去体会。

另外关于`流`的概念，强烈建议大家有时间去看一下这篇长文，

[stream-handbook 中文版](https://github.com/jabez128/stream-handbook)

[stream-handbook 英文版](https://github.com/stop2stare/stream-handbook)


## TODO

本章节简要陈述了`流`，在后面的章节也许会继续讲述。



[lesson02-网络](../lesson02-网络/README.md)

