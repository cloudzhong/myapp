var dbcof = require('./db')

function MongoDoc(doc) {
    this.doc = doc
}
module.exports = MongoDoc

/*
option support settings
    col:collection  
    criteria: condition
    upsert : will insert the document if not exists
    index: need create index on this field
    
*/
MongoDoc.update = function (doc, option, callback){
  if (!option.col){
      err = new Error("Collection name must provided")
      callback(err, null)
  } else if (!option.criteria) {
      err = new Error("criteria must provided")
      callback(err, null)
  }
    var willcreate = option.upsert?option.upsert:true
    dbcof.MongoClient.connect(dbcof.url, function(err, db) {
    var collect = db.collection(option.col)
    if (option.index) {
        collect.createIndex(option.index, {unique: true} )
        console.log('index on collection :' + option.col + " created index : " + option.index)
    }
    collect.findOneAndUpdate(option.criteria,
        {$set: doc} ,
        {upsert:willcreate,returnOriginal:false},
          function(err, doc) {
            if (err) {
                console.error(err.message)
            }
            db.close()
            callback(err, doc)
          })
    })
}

MongoDoc.findOne = function(col, criteria, callback) {
    dbcof.MongoClient.connect(dbcof.url, function(err, db) {
        db.collection(col).findOne(criteria,function(err,doc){
            console.log("search result: ",doc) 
            if (err) {
                console.error(err)
            } 
            db.close()
            callback(err,doc)
        })
    })
}

MongoDoc.search = function(col, criteria, callback) {
    dbcof.MongoClient.connect(dbcof.url, function(err, db) {
    // 讀取 users 集合
    db.collection(col).find(criteria).toArray(function(err,data){
        if (err) {
            console.error(err)
        } 
        db.close()
        callback(err,data)
    })
  })
}

MongoDoc.del = function(col, criteria, callback) {
    dbcof.MongoClient.connect(dbcof.url, function(err, db) {
    // 讀取 users 集合
    db.collection(col).deleteOne(criteria, function(err,data){
        if (err) {
            console.error(err)
        } 
        db.close()
        callback(err,data)
    })
  })
}
