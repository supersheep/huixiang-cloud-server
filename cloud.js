var AV = require('leanengine');
var accountService = require('./services/account');
var favService = require('./services/fav');
var pieceService = require('./services/piece');
var creatorPostService = require('./services/creatorPost');

AV.Cloud.define('featured', function(request, response) {
  pieceService.getHomeFeatured(request.params.amount)
    .then(response.success)
    .catch(response.error)
})

AV.Cloud.define('getMyPieces', function(request, response) {
  pieceService.getUserFeeds(request.currentUser, request.params.page)
    .then(response.success)
    .catch(response.error)
})

AV.Cloud.define('favPiece', function(request, response) {
  favService.favPieceWithUser(request.params.pieceId, request.currentUser)
    .then(response.success)
    .catch(response.error)
})


AV.Cloud.define('unfavPiece', function(request, response) {
  favService.unfavPieceWithUser(request.params.pieceId, request.currentUser)
    .then(response.success)
    .catch(response.error)
})

AV.Cloud.define('getPieceDetail', function(request, response) {
  pieceService.findPieceWithContent(request.params.pieceId, request.currentUser)
    .then(response.success)
    .catch(response.error)
})

AV.Cloud.define('createPiece', function(request, response){
  var pieceData = request.params.piece
  var content = pieceData.content
  var currentUser = request.currentUser

  pieceService.findPieceWithContent(content)
    .then((piece) => {
      return piece || pieceService.createPiece(pieceData, currentUser)
    })
    .then((piece) => {
      favService.favPieceWithUser(piece.id, currentUser)
        .then((fav) => {
          response.success(piece)
        })
    })
    .catch(response.error)
})

AV.Cloud.define('getPieceFavs', function(request, response) {
  favService.getPieceFavs(request.params.pieceId)
    .then(response.success)
    .catch(response.error)
})

AV.Cloud.define('creatorPosts', function(request, response) {
  return creatorPostService.getAllPosts()
    .then(response.success)
    .catch(response.error)
})

/* 运营用 */
AV.Cloud.define('removePiece', function(request, response) {
  pieceService.removePiece(request.params.id, request.currentUser)
    .then(response.success)
    .catch(response.error)
})

AV.Cloud.define('rankPiece', function(request, response) {
  pieceService.rankPiece(request.params.id, request.params.rank, request.currentUser)
    .then(response.success)
    .catch(response.error)
})


AV.Cloud.define('getPieces', function(request, response) {
  pieceService.getPieceList(request.params.page)
    .then(response.success)
    .catch(response.error)
})




module.exports = AV.Cloud;
