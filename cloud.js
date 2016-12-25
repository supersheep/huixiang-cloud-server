var AV = require('leanengine');

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function(request, response) {
  response.success('Hello world!');
});

AV.Cloud.define('getMyPieces', function(request, response) {
    var query = new AV.Query('Fav')
    var page = request.params.page || 0
    var limit = 200

    if (!request.currentUser) {
      return response.error('请先登录')
    }

    query.include('piece')
    query.equalTo('user', request.currentUser)
    query.descending('createdAt')
    query.limit(limit)
    query.skip(page * limit)
    query.find()
      .then((favs) => {
        response.success(favs.map((fav) => {
          var piece = fav.get('piece')
          piece.set('createdAt', fav.get('createdAt'))
          return piece
        }))
      })
      .catch((err) => {
        response.error(err)
      })
})

AV.Cloud.define('favPiece', function(request, response) {
  var currentUser = request.currentUser

  if (!currentUser) {
    return response.error('请先登录')
  }

  if (!request.params.pieceId) {
    return response.error('missing pieceId')
  }

  var piece = null
  var query = new AV.Query('Piece')
  query.get(request.params.pieceId)
  query.first()
    .then((_piece) => {
      if (!_piece) {throw new Error('该内容不存在')}
      piece = _piece
      var query = new AV.Query('Fav')
      query.equalTo('user', currentUser)
      query.equalTo('piece', _piece)
      return query.first()
    })
    .then((oldFav) => {
      if (oldFav) {throw new Error('已经收藏过该内容')}
      var Fav = AV.Object.extend('Fav')
      var fav = new Fav()
      fav.set('user', currentUser)
      fav.set('piece', piece)
      return fav.save()
    })
    .then((newFav) => {
      response.success(newFav)
    })
    .catch((err) => {
      response.error(err)
    })
})

AV.Cloud.define('removePiece', function(request, response) {
  var query = new AV.Query('Piece')
  query.equalTo('objectId', request.params.id)
  query.first((piece) => {
    if (!piece) {
      return response.error('piece not exists')
    }
    piece.set('valid', false)
    piece.save()
      .then(() => {
        response.success('success')
      })
  })
})

AV.Cloud.define('unfavPiece', function(request, response) {
  var Fav = AV.Object.extend('Fav')
  var fav = new Fav()
  var currentUser = request.currentUser

  if (!currentUser) {
    return response.error('请先登录')
  }

  if (!request.params.pieceId) {
    return response.error('missing pieceId')
  }

  var query = new AV.Query('Piece')
  query.get(request.params.pieceId)
  query.first()
    .then((piece) => {
      if (!piece) { throw new Error('该内容不存在')}
      var query = new AV.Query('Fav')
      query.equalTo('piece', piece)
      query.equalTo('user', currentUser)
      return query.first()
        .then((fav) => {
          if (!fav) {throw new Error('无权访问该记录')}
          console.log('fav', fav)
          return fav.destroy()
        })
    })
    .then((newFav) => {
      response.success('success')
    })
    .catch((err) => {
      response.error(err)
    })
})

AV.Cloud.define('getPieceDetail', function(request, response) {
  var query = new AV.Query('Piece')
  var currentUser = request.currentUser
  query.get(request.params.pieceId)

  query.first()
    .then((piece) => {
      if (request.currentUser && piece.get('user').get('objectId') === request.currentUser.get('objectId')) {
        piece.set('faved', true)
      } else {
          new AV.Query('Fav')
            .equalTo('piece', piece)
            .equalTo('user', request.currentUser)
            .count()
              .then((count) => {
                piece.set('faved', count > 0)
                response.success(piece)
              })
              .catch((err) => {
                response.error(err)
              })
      }
      response.success(piece)
    })
    .catch((err) => {
      response.error(err)
    })
})

AV.Cloud.define('createPiece', function(request, response){
  var Piece = AV.Object.extend("Piece");
  var piece = new Piece();
  var pieceData = request.params.piece
  var currentUser = request.currentUser

  if (!currentUser) {
    return response.error('请先登录')
  }

  if (!pieceData.content) {
    return response.error('请填写内容')
  }

  if (!pieceData.content.length > 280){
    return response.error('内容请勿超过280')
  }

  piece.set('content', pieceData.content)
  piece.set('user', currentUser)
  piece.save()
    .then((newPiece) => {
      var Fav = AV.Object.extend('Fav')
      var fav = new Fav();
      fav.set('user', currentUser)
      fav.set('piece', newPiece)
      piece = newPiece
      return fav.save()
    }).then(() => {
      response.success(piece)
    }).catch((err) => {
      response.error(err)
    })
})

AV.Cloud.define('getPieceFavs', function(request, response) {
  var query = new AV.Query('Fav')
  var piece = AV.Object.createWithoutData('Piece', request.params.pieceId)

  query.equalTo('piece', piece)
  query.include('user')
  query.find()
    .then((favs) => {
      response.success(favs.map((fav) => {
        return fav.get('user')
      }))
    })
    .catch((err) => {
      response.error(err)
    })
})

AV.Cloud.define('getPieces', function(request, response) {
  var query = new AV.Query('Piece')
  var page = request.params.page || 1
  var limit = 50
  query.include('user')
  query.skip(Math.max(page - 1, 0) * limit)
  query.descending('createdAt')
  query.notEqualTo('valid', false)
  query.find()
    .then((pieces) => {
      response.success(pieces.map((p) => {
        p.set('user', p.get('user'))
        return p
      }))
    })
    .catch((err) => {
      response.error(err)
    })
})

AV.Cloud.define('creatorPosts', function(request, response) {
  var query = new AV.Query('CreatorPost')
  query.descending('createdAt')
  query.find()
    .then(function(result) {
      console.log('result', result)
      response.success(result)
    })
    .catch(function(err) {
      console.log(err)
      response.error(err)
    })
})

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
