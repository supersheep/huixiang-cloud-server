'use strict';
// require("babel-core/register");


var AV = require('leanengine');
var knex = require('knex')

var client = knex({
  client: 'mysql', //指明数据库类型，还可以是mysql，sqlite3等等
  connection: { //指明连接参数
    host : '127.0.0.1',
    user : 'root',
    password : 'rgnxhgrqswhm',
    database : 'huixiang'
  },
  useNullAsDefault: true
})

AV.init({
  appId: 'pYL1DTgVOWXq9UKsM4yJAP3z-gzGzoHsz',
  appKey: 'W4n5OjaaDtdzkEiPi4cJf5dv',
  masterKey: '2T0iCrHr8j6lCvUq47TJrjRe'
});

// 如果不希望使用 masterKey 权限，可以将下面一行删除
AV.Cloud.useMasterKey();

async function insertPiece (piece) {
  await client('piece').insert(piece)
}

var pieceService = require('./services/piece')
async function insertAll () {
  for (let i = 0 ; i < 8; i++) {
    try {
      let pieces = await pieceService._getAllPieces(i)
      // console.log(pieces.length)
      console.log(`fetch group ${i}`)
      for (let j = 0; j < pieces.length; j++) {
        let piece = pieces[j]
        console.log(`insert ${i * 1000 + j} item`)
        await insertPiece({
          content: piece.get('content')
        })
      }
    } catch (e) {
      console.log(e)
      process.exit(1)
    }
  }
}

async function insertOne () {
  try {
    await insertPiece({
      content: '😆'
    }) 
  } catch (e) {
    console.log('e', e)
  }
}

async function removeDeplicated () {
  let pieces = await client('piece').select()
  piece.forEach((piece) => {
  })
  console.log(pieces.length)
}

removeDeplicated()
// insertOne()
// insertAll()