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

async function countWords () {
  
  var Segment = require('node-segment').Segment;
  // 创建实例
  var segment = new Segment();
  // 使用默认的识别模块及字典
  segment.useDefault();

  var pieces = await client('piece').select()
  for (let i = 0; i < pieces.length; i++) {
    let piece = pieces[i]
    let segments = segment.doSegment(piece.content)
    for (let j = 0; j < segments.length; j++) {
      let seg = segments[j]
      let w = seg.w
      let p = seg.p
      await client('words').insert({
        word: w,
        p: p
      })
      console.log(`${w} ${p}`)
    }
  }
}

async function splitSegment (segment, piece) {
  return new Promise((resolve, reject) => {
    // setTimeout(() => {
    //   console.log('oo')
    //   resolve(null)
    // }, 2000)
    console.log('piece.content', piece.content)
    let segments = segment.doSegment(piece.content)
    resolve(segments)
  })
}

async function splitWords () {
  
  var Segment = require('node-segment').Segment;
  // 创建实例
  var segment = new Segment();
  // 使用默认的识别模块及字典
  segment.useDefault();

  var pieces = await client('piece').whereNull('segments').select()
  console.log('pieces.length', pieces.length)
  for (let i = 0; i < pieces.length; i++) {
    let piece = pieces[i]
    let segments = await splitSegment(segment, piece)
    console.log('segments', segments)
    await client('piece').update({
      segments: segments ? JSON.stringify(segments) : null
    }).where('id', '=', piece.id)
  }
}



try {
  splitWords()
} catch (e) {
  console.log('err', e)
}

// removeDeplicated()
// insertOne()
// insertAll()