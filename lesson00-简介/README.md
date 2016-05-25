# lesson00-简介

## nodejs是什么

`nodejs`的[github主页](https://github.com/nodejs/node)上是这么说的：Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient. The Node.js package ecosystem, npm, is the largest ecosystem of open source libraries in the world.（nodejs是建立在chrome V8引擎上的一个JavaScript运行环境。nodejs使用了事件驱动，非阻塞IO的模型来让它更加轻量级、高效。nodejs的包生态——npm——是世界上最大的开源库。）

不必纠结于什么是事件驱动、非阻塞IO，我们学习语言不要从概念入手，而要先学习使用，然后再从自己的使用经验来思考什么是事件驱动与非阻塞IO。

## nodejs能干什么

每一种解析器都是一个运行环境，不但允许JS定义各种数据结构，进行各种计算，还允许JS使用运行环境提供的内置对象和方法做一些事情。例如运行在浏览器中的JS的用途是操作DOM，浏览器就提供了document之类的内置对象。而运行在NodeJS中的JS的用途是操作磁盘文件或搭建HTTP服务器，NodeJS就相应提供了fs、http等内置对象。

上面一段直接摘自[Alibaba - 七天学会nodejs](http://nqdeng.github.io/7-days-nodejs/)

## 安装

请直接下载安装包吧，先不要管`NVM`或者`编译安装`，[点击这里选择你要的版本](https://nodejs.org/download/release/)

## hello world

安装好了之后直接打开终端：
```
$ node
> console.log('hello world!')
hello world!
```

OK，至此你已经完成了`nodejs`的起步了。

[lesson01-操作文件](../lesson01-操作文件/README.md)