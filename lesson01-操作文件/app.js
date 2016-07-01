var fs = require('fs'),
    _argv = process.argv.slice(2); // 获取命令行参数

var filePath = _argv[0];

var readStream = fs.createReadStream(filePath); // 创建一个可读流
var writeStream = fs.createWriteStream(_argv[1]); // 创建一个可写流

var stat = fs.statSync(filePath); // 获取文件信息
var totalSize = stat.size / (Math.pow(1024, 3)); // 文件大小
console.time('传输耗时');

// 事件触发写法
可读流触发'data'事件——有数据流入
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


// pipe写法
// readStream.pipe(writeStream, {end: false});
// readStream.on('end', function() {
// 	console.timeEnd('传输耗时');
// 	console.info('数据传输结束，总共 %s GB', totalSize.toFixed(2));
// });
	