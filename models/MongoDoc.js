var ObjectID = require('mongodb').ObjectID;
/*global db*/

this.updateById = function(id, col, doc, callback) {
  update(doc, {
    'col': col,
    'criteria': {
      "_id": new ObjectID(id)
    }
  }, callback);
};

this.findById = function(id, col, callback) {
    this.findOne(col, {
      "_id": new ObjectID(id)
    }, callback);
};

function update(doc, option, callback) {
  var err = null;
  if (!option.col) {
    err = new Error("Collection name must provided");
    return callback(err, null);
  }
  else if (!option.criteria) {
    err = new Error("criteria must provided");
    return callback(err, null);
  }
  var upsert = option.upsert ? option.upsert : false;

  db.collection(option.col).findOneAndUpdate(option.criteria, {
      $set: doc
    }, {
      upsert: upsert,
      returnOriginal: false
    },
    function(err, doc) {
      if (err) {
        console.error('***********Error in update document: ', err.message);
        return callback(err, null);
      }
      return callback(err, doc.value);
    });
}

this.findOne = function(col, criteria, callback) {
  db.collection(col).findOne(criteria, function(err, doc) {
    if (err) {
      console.error(err);
      return callback(err, null);
    }
    callback(err, doc);
  })
}

this.find = function(col, criteria, sort, callback) {
  var cur = db.collection(col).find(criteria);
  if (sort)
    cur.sort(sort)
  cur.toArray(function(err, data) {
    if (err) {
      console.error(err);
      return callback(err, null);
    }
    callback(err, data);
  })
}

this.delById = function(id, col, callback) {
  this.del(col, {
    "_id": new ObjectID(id)
  }, callback)
}

function del(col, criteria, callback) {
  db.collection(col).deleteOne(criteria, function(err, data) {
    if (err) {
      console.error(err);
      return callback(err, null);
    }
    callback(err, data);
  })
}


this.save = function (col, doc, cb) {
    var col = db.collection(col);
    col.insert(doc, {safe: true}, function(err, result) {
         cb(err, result);
    });
};

this.createIndex = function(col,index,unique){
    db.collection(col).createIndex(index,{unique:unique});
}