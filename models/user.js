
exports.save = function (doc,callback) {
    var collection = db.collection('users')
    // 爲 name 屬性添加索引
    collection.createIndex('name', {unique: true} )
    // 寫入 user 文檔
    collection.insertOne(doc, function(err, user) {
        if (err) {
            console.error("error in insert user") 
        } else {
            console.log(doc + "inserted") 
        }
        callback(err, user)
    })
}

exports.get = function(username, callback) {
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        return callback(err)
      }
      // 查找 name 屬性爲 username 的文檔
      collection.findOne({name: username}, function(err, doc) {
            callback(err, doc)
      })
   })
}
