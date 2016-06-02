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
var path = argv.dir || process.cwd();

app.use(serveStatic(path, {"index": ["index.html"]}));
app.use(serveIndex(path, {"icons": true})).listen(port, function() {
	if (!argv.silent) {
		openUrl('http://' + hostname + ':' + port);
	}
	console.log('server is running at http://%s:%s', hostname, port);
});