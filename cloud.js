var AV = require('leanengine');

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function(request, response) {
  response.success('Hello world!');
});

AV.Cloud.define('createUserWithThirdPartyUser', function(request, response) {
  var thirdPartyUser = request.params.thirdPartyUser
  var username = request.params.username
  var password = request.params.password
  var nickname = request.params.nickname

  if (!thirdPartyUser) {
    response.error('missing thirdPartyUser')
  }

  if (!thirdPartyUser.id) {
    response.error('missing thirdPartyUser.id')
  }

  if (!thirdPartyUser.platform) {
    response.error('missing thirdPartyUser.accessKey')
  }

  if (!thirdPartyUser.accessKey) {
    response.error('missing thirdPartyUser.accessKey')
  }

  if (!nickname) {
    response.error('missing nickname')
  }

  var attrs = {}
  attrs[thirdPartyUser.platform + 'Id'] = thirdPartyUser.id
  attrs[thirdPartyUser.platform + 'AccessToken'] = thirdPartyUser.accessToken
  attrs[thirdPartyUser.platform + 'Binded'] = 1
  attrs.name = nickname

  AV.User.signUp(username, password, attrs)
    .then((user) => {
      response.success(user)
    }).catch((err) => {
      response.error(err)
    })
})

AV.Cloud.define('bindUserWithThirdPartyUser', function(request, response) {
  var thirdPartyUser = request.params.thirdPartyUser
  var username = request.params.username
  var password = request.params.password
  var nickname = request.params.nickname
  var platform = thirdPartyUser.platform || 'weibo'

  if (!thirdPartyUser.id) {
    return response.error('missing thirdPartyUser.id')
  }

  if (!thirdPartyUser.accessToken) {
    return response.error('missing thirdPartyUser.accessToken')
  }

  var queryId = new AV.Query('_User')
  var platformKey = platform + 'Id'
  queryId.equalTo(platformKey, thirdPartyUser.id)

  var queryAccessToken = new AV.Query('_User')
  var accessTokenKey = platform + 'AccessToken'
  queryAccessToken.equalTo(accessTokenKey, thirdPartyUser.accessToken)

  var query = AV.Query.and(queryId, queryAccessToken)

  queryId.first()
    .then((user) => {
      if (!user) {
        response.error('thirdparty user not exists')
      } else {
        user.setUsername(username)
        user.setPassword(password)
        user.set('name', nickname)
        user.set(platform + 'Binded', 1)
        user.save()
          .then((u) => {
            response.success(u)
          })
          .catch((err) => {
            response.error(err)
          })
      }
    })
    .catch((err) => {
      response.error(err)
    })
})

AV.Cloud.define('getThirdPartyUser', function(request, response) {
  var queryId = new AV.Query('_User')
    .equalTo((request.params.platform || 'weibo') + 'Id', request.params.id || 0)
  var queryValid = new AV.Query('_User')
    .notEqualTo('invalid', true)

  var query = AV.Query.and(queryId, queryValid)
  query.first().then(function(result){
    if (result) {
      response.success(result)
    } else {
      response.success(null)
    }
  }).catch(function(err){
    response.error(err)
  })
});

AV.Cloud.define('featured', function(request, response) {

  var query = new AV.Query('Piece')

  query.count().then(function (result) {
    var nums = []
    while (nums.length < Math.min(100, request.params.amount || 100)) {
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
    response.error(err)
  })
})

module.exports = AV.Cloud;
