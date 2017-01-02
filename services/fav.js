var AV = require('leanengine');

function getPieceFavs (pieceId) {
  return new Promise((resolve, reject) => {
    var query = new AV.Query('Fav')
    var piece = AV.Object.createWithoutData('Piece', pieceId)

    query.equalTo('piece', piece)
    query.include('user')
    query.find()
      .then((favs) => {
        resolve(favs.map((fav) => {
          return fav.get('user')
        }))
      })
      .catch(reject)
  })
}

function favPieceWithUser (pieceId, user) {
  return new Promise((resolve, reject) => {
    if (!user) {
      return reject('请先登录')
    }

    if (!pieceId) {
      return reject('missing pieceId')
    }

    var piece = null
    var query = new AV.Query('Piece')
    query.get(pieceId)
    query.first()
      .then((_piece) => {
        if (!_piece) {throw new Error('该内容不存在')}
        piece = _piece
        var query = new AV.Query('Fav')
        query.equalTo('user', user)
        query.equalTo('piece', _piece)
        return query.first()
      })
      .then((oldFav) => {
        if (oldFav) { return oldFav}
        var Fav = AV.Object.extend('Fav')
        var fav = new Fav()
        fav.set('user', user)
        fav.set('piece', piece)
        return fav.save()
      })
      .then((newFav) => {
        resolve(newFav)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

function unfavPieceWithUser (piece, user) {
  return new Promise((resolve, reject) => {
    var Fav = AV.Object.extend('Fav')
    var fav = new Fav()

    if (!user) {
      return reject('请先登录')
    }

    if (!pieceId) {
      return reject('missing pieceId')
    }

    var query = new AV.Query('Piece')
    query.get(pieceId)
    query.first()
      .then((piece) => {
        if (!piece) { throw new Error('该内容不存在')}
        var query = new AV.Query('Fav')
        query.equalTo('piece', piece)
        query.equalTo('user', user)
        return query.first()
          .then((fav) => {
            if (!fav) {throw new Error('无权访问该记录')}
            return fav.destroy()
          })
      })
      .then((newFav) => {
        resolve('success')
      })
      .catch(reject)
  })
}

module.exports = {
  favPieceWithUser: favPieceWithUser,
  unfavPieceWithUser: unfavPieceWithUser
}
