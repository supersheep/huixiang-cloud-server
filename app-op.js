'use strict';
var express = require('express');
var timeout = require('connect-timeout');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var AV = require('leanengine');
var cors = require('cors');
var passport = require('passport');
var app = express();
var md5 = require('md5');
var jwt = require('jsonwebtoken');

app.set('superSecret', 'hx5');

app.use(cors());

// 设置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(AV.Cloud.CookieSession({ secret: 'my secret', maxAge: 3600000, fetchUser: true }));
app.use(express.static('public'));

// 设置默认超时时间
app.use(timeout('15s'));

// 加载云函数定义
require('./cloud');
// 加载云引擎中间件
app.use(AV.express());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const auth = (req, res, next) => {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  jwt.verify(token, app.get('superSecret'), function(err, decoded) {
    if (err) {
      res.status(401)
      return res.end('Failed to authenticate token.');
    } else {
      // if everything is good, save to request for use in other routes
      req.decoded = decoded;
      next();
    }
  });
};

app.get('/api/env', function(req, res, next) {
  var query = new AV.Query('Config')
  query.equalTo('key', 'env')
  query.first()
    .then((result) => {
      res.json(result.toJSON().value)
    })
    .catch(next)
})

app.post('/api/login', function(req, res, next) {
  var name = req.body.name
  var password = req.body.password
  var query = new AV.Query('Admin')
  query.equalTo('name', name)
  query.equalTo('password', md5(password))
  query.first()
    .then((user) => {
      if (!user) {
        return next(new Error('user not exists'))
      }
      var token = jwt.sign(user, app.get('superSecret'), {
        expiresIn: 60 * 60 * 24 // expires in 24 hours
      });
      res.json({
        token: token
      })
    })
    .catch(next)
})

app.get('/api/piece', auth, function(req, res) {
  AV.Cloud.run('getPieces', {
    page: req.query.page,
    userId: req.query.userId
  }).then((result) => {
    res.json(result.map((data) => {
      return data.toJSON()
    }))
  })
})

app.put('/api/piece/:id', auth, function(req, res) {
  AV.Cloud.run('rankPiece', {
    id: req.params.id,
    rank: req.body.rank
  }).then((result) => {
    res.json("success")
  })
})

app.delete('/api/piece/:id', auth, function(req, res) {
  AV.Cloud.run('removePiece', {
    id: req.params.id
  }).then((result) => {
    res.json("success")
  })
})

app.get('/', auth, function(req, res) {
  res.render('index', { currentTime: new Date() });
});

app.use(function(req, res, next) {
  // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器
  if (!res.headersSent) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
});

// error handlers
app.use(function(err, req, res, next) { // jshint ignore:line
  var statusCode = err.status || 500;
  if(statusCode === 500) {
    console.error(err.stack || err);
  }
  if(req.timedout) {
    console.error('请求超时: url=%s, timeout=%d, 请确认方法执行耗时很长，或没有正确的 response 回调。', req.originalUrl, err.timeout);
  }
  res.status(statusCode);
  res.end(err.message);
});

module.exports = app;
