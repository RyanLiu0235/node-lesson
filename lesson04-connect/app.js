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