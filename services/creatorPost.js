var AV = require('leanengine');

function getAllPosts () {
  var query = new AV.Query('CreatorPost')
  query.descending('createdAt')
  return query.find()
}

module.exports = {
  getAllPosts: getAllPosts
}
