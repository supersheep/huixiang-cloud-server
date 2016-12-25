var express = require('express');
var vhost = require('vhost');
var appOP = require("./app-op");
var appMobile = require("./app-mobile");

module.exports = appOP
// var app = module.exports = express();
//
// app.use(vhost('lc.huixiang.im', appMobile));
// app.use(vhost('oplc.huixiang.im', appOP));
