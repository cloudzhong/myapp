var ObjectID = require('mongodb').ObjectID

function MongoDoc(doc) {
    this.doc = doc
}
module.exports = MongoDoc


MongoDoc.updateById = function (id, col, doc, callback){
  
  this.update(doc,{'col':col, 'criteria': {"_id":new ObjectID(id)}},callback)
}
MongoDoc.findById = function (id, col, callback) {
  try {
  this.findOne(col, {"_id":new ObjectID(id)}, callback);
  } catch (err) {
    throw new Error("Can not found doc with Id: " + id);
  }
}
/*
option support settings
    col:collection  
    criteria: condition
    upsert : will insert the document if not exists
    index: need create index on this field
    
*/

MongoDoc.updateById = function(id,col,doc,callback){
  this.update(doc, {col:col,criteria:{"_id":new ObjectID(id)}}, callback)
}

MongoDoc.update = function (doc, option, callback){
  if (!option.col){
      err = new Error("Collection name must provided")
      callback(err, null)
  } else if (!option.criteria) {
      err = new Error("criteria must provided")
      callback(err, null)
  }
    var willcreate = option.upsert?option.upsert:false
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
                console.error('***********Error in update document: ',err.message);
                return callback(err, null)
            }
            callback(err, doc.value)
          })
}

MongoDoc.findOne = function(col, criteria, callback) {
  db.collection(col).findOne(criteria,function(err,doc){
      if (err) {
          console.error(err);
          return callback(err, null);
      } 
      callback(err,doc);
  })
}

MongoDoc.find = function(col, criteria, callback) {
  // 讀取 users 集合
  db.collection(col).find(criteria).toArray(function(err,data){
      if (err) {
          console.error(err);
          return callback(err, null);
      } 

      callback(err,data);
  })
}

MongoDoc.delById = function(id,col,callback){
  this.del(col, {"_id":new ObjectID(id)}, callback)
}

MongoDoc.del = function(col, criteria, callback) {
  // 讀取 users 集合
  db.collection(col).deleteOne(criteria, function(err,data){
      if (err) {
          console.error(err);
          return callback(err, null);
      } 
      callback(err,data);
  })
}
