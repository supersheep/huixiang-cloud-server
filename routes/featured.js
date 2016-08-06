var router = require('express').Router()
var AV = require('leanengine')

router.get('/', function(req, res, next) {
  AV.Cloud.run('featured', {
    a: 1
  }, {
    success: function(data) {
      // 调用成功，得到成功的应答data
      res.send(data)
    },
    error: function(err) {
      next(err)
    }
  }) 
})

module.exports = router