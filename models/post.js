var ObjectID = require('mongodb').ObjectID
var DBRef = require('mongodb').DBRef
var docName = "posts"
exports.save = function (user, data, cb) {
  console.log('user is ',user)
  var doc = {
    user: user._id,
    author: user.name,
    avatar: user.avatar,
    time: new Date(),
    title: data.title,
    tag: data.tag,
    content: data.content,
    comments: [],
    pv: 0
  };
    // 讀取 posts 集合
    var col = db.collection('posts')
    // 爲 user 屬性添加索引
    col.createIndex('user');
    // 寫入 post 文檔
    col.insert(doc, {safe: true}, function(err, post) {
         cb(err, post);
    });
};

exports.comments = function(id, comment, callback){
  db.collection('posts').updateOne({_id:new ObjectID(id)},
    {"$push": {comments: comment}}, 
    function (err, doc){
      if (err) {
        console.error('***********Error in add comments: ',err.message);
        return callback(err, null)
      }
      callback(err, doc.value)
  })
}

exports.updateById = function (id, doc, callback) {
  db.collection(docName).findOneAndUpdate( {"_id":new ObjectID(id)},
      {$set: doc} ,
      {returnOriginal:false},
      function(err, doc) {
        if (err) {
            console.error(err.message)
        }
        console.log(doc," is the new post")
        callback(err, doc)
      })
}

exports.get = function (username, callback) {
    
    var col = db.collection('posts')
    // 查找 user 屬性爲 username 的文檔，如果 username 是 null 則匹配全部
    var query = {};
    if (username) {
        query.user = username;
    }
    col.find(query).sort({time: -1}).toArray(function(err, docs) {
    if (err) {
      callback(err, null);
    }
    // 封裝 posts 爲 Post 對象
    var posts = [];
    /*
    docs.forEach(function(doc, index) {
      posts.push(doc);
    });
    */
    callback(null, docs);
    });
};

exports.getbyId = function (id, callback) {
    
    var col = db.collection('posts')
    // 查找 user 屬性爲 username 的文檔，如果 username 是 null 則匹配全部
    var query = {"_id":new ObjectID(id)};
    col.findOne(query,function(err,doc){
      if (err) {
         callback(err, null);
      } 
      callback(null,doc)
  })
};
