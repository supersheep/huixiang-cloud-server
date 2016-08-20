var AV = require('leanengine');

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function(request, response) {
  response.success('Hello world!');
});

AV.Cloud.define('featured', function(request, response) {
  var query = new AV.Query('Piece')

  query.count().then(function (result) {
    var nums = []
    while (nums.length < Math.min(100, request.params.amount)) {
      var num = Math.floor(Math.random() * result)
      if (nums.indexOf(num) == -1) {
        nums.push(num)
      }
    }
    var subQuerys = nums.map((num) => {
      return new AV.Query('Piece').equalTo('objectId', `${num}`)
    })
    var query = AV.Query.or.apply(null, subQuerys)
    return query.find()
  }).then((result) => {
    response.success(result)
  }).catch((err) => {
    response.error(result)
  })
})

module.exports = AV.Cloud;
