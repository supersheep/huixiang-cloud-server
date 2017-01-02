var AV = require('leanengine');

function removePiece (pieceId, user) {
  return new Promise((resolve, reject) => {
    var query = new AV.Query('Piece')
    query.equalTo('objectId', pieceId)
    query.first((piece) => {
      if (!piece) {
        return reject('piece not exists')
      }
      piece.set('valid', false)
      piece.save()
        .then(() => {
          resolve('success')
        })
    })
  })
}

function rankPiece (pieceId, rank, user) {
  return new Promise((resolve, reject) => {
    if (!pieceId) {
      return reject('missing pieceId')
    }
    if (!rank) {
      return reject('missing rank')
    }
    if (rank < 0 || rank > 10) {
      return reject('invalid rank')
    }
    var query = new AV.Query('Piece')
    query.equalTo('objectId', pieceId)
    query.first((piece) => {
      if (!piece) {
        return reject('piece not exists')
      }
      piece.set('rank', rank)
      piece.save()
        .then(() => {
          resolve('success')
        })
    })
  })
}

function getPieceDetail (pieceId, user) {
  return new Promise((resolve, reject) => {
    var query = new AV.Query('Piece')
    query.get(pieceId)

    query.first()
      .then((piece) => {
        if (user && piece.get('user').get('objectId') === user.get('objectId')) {
          piece.set('faved', true)
        } else {
            new AV.Query('Fav')
              .equalTo('piece', piece)
              .equalTo('user', user)
              .count()
                .then((count) => {
                  piece.set('faved', count > 0)
                  resolve(piece)
                })
                .catch(reject)
        }
        resolve(piece)
      })
      .catch(reject)
  })
}

function getPieceList (page, filter) {
  return new Promise((resolve, reject) => {
    var query = new AV.Query('Piece')
    var limit = 50
    page = page || 1
    query.include('user')
    query.skip(Math.max(page - 1, 0) * limit)
    query.descending('createdAt')
    query.notEqualTo('valid', false)

    if (filter.userId) {
      var user = AV.Object.createWithoutData('_User', filter.userId);
      console.log('filter by userId', filter.userId)
      query.equalTo('user', user)
    }

    query.find()
      .then((pieces) => {
        resolve(pieces.map((p) => {
          var user = p.get('user')
          // console.log('user', user.toJSON())
          p.set('user', user.toJSON())
          return p
        }))
      })
      .catch(reject)
  })
}

function getHomeFeatured (amount) {
  return new Promise((resolve, reject) => {
    var query = new AV.Query('Piece')

    query.count().then(function (result) {
      var nums = []
      while (nums.length < Math.min(100, amount || 100)) {
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
    })
    .then(resolve)
    .catch(reject)
  })
}

function createPiece (pieceData, user) {
  return new Promise((resolve, reject) => {
    if (!user) {
      return response.error('请先登录')
    }

    if (!pieceData.content) {
      return response.error('请填写内容')
    }

    if (!pieceData.content.length > 280){
      return response.error('内容请勿超过280')
    }

    var Piece = AV.Object.extend("Piece");
    var piece = new Piece();
    piece.set('content', pieceData.content)
    piece.set('user', user)
    piece.save()
      .then((newPiece) => {
        resolve(newPiece)
      }).catch((err) => {
        response.error(err)
      })
  })
}

function findPieceWithContent (content) {
  return new Promise((resolve, reject) => {
    var query = new AV.Query('Piece')
    query.equalTo('content', content)
    query.first()
      .then((existPiece) => {
        resolve(existPiece)
      })
  })
}

function getUserFeeds (user, page) {
  var query = new AV.Query('Fav')
  var page = page || 0
  var limit = 200

  return new Promise((resolve, reject) => {
    if (!user) {
      return response.error('请先登录')
    }

    query.include('piece')
    query.equalTo('user', user)
    query.descending('createdAt')
    query.limit(limit)
    query.skip(page * limit)
    query.find()
      .then((favs) => {
        resolve(favs.map((fav) => {
          var piece = fav.get('piece')
          piece.set('createdAt', fav.get('createdAt'))
          return piece
        }))
      })
      .catch((err) => {
        reject(err)
      })
  })
}


module.exports = {
  removePiece: removePiece,
  rankPiece: rankPiece,
  getUserFeeds: getUserFeeds,
  getHomeFeatured: getHomeFeatured,
  findPieceWithContent: findPieceWithContent,
  getPieceList: getPieceList
}
