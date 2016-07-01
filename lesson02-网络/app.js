var server = require('http').createServer(),
	fs = require('fs'),
	path = require('path');

server.on('request', function(req, res) {
	var _url = path.normalize('.' + req.url);
	fs.exists(_url, function(exist) {
		if (exist) {
			fs.stat(_url, function(err, stat) {
				if (err) { // 如果找不到资源
					console.log(err);
					res.writeHead(500);
					res.end('网络错误', 'utf8');
				}

				if (stat.isDirectory()) { // 如果输入的地址是一个目录
					res.writeHead(403);
					res.end('禁止访问', 'utf8');
				}

				else { // 如果地址输入无误
					var readStream = fs.createReadStream(_url);
					res.writeHead(200);
					readStream.pipe(res);
				}
			})
		} else { // 如果地址找不到
			res.writeHead(404);
			res.end('输入地址有误', 'utf8');
		}
	});
});
server.listen('3100', function() {
	console.log('服务器运行在 3100 端口');
});