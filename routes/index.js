var gravatar = require('gravatar');
var express = require('express');
var crypto = require('crypto');
var ObjectID = require('mongodb').ObjectID;
var Post = require('../models/post');
var mdoc = require('../models/MongoDoc');
var User = require('../models/user.js');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    mdoc.find('posts', null, {time:-1},function(err, posts) {
      res.render('index', {
        title: '首頁',
        posts: posts,
      });
    });
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res) {
    res.render('reg', {title: '用户注册' });
    res.end;
});

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res) {
    console.log("before register users..");
    //检验用户两次输入的口令是否一致
    if (req.body['password-repeat'] != req.body['password']) {
        req.session.error = '两次输入的口令不一致';
        return res.redirect('/reg');
    }

console.log(req.body);
    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var newUser = {
        name: req.body.username,
        password: password,
        email: req.body.email,
        avatar: gravatar.url(req.body.email)
    };
    
    //检查用户名是否已经存在
    User.get(newUser.name, function(err, user) {
        if (user) {
            err = 'Username already exists.';
            console.log("User already exists : " + err);
            req.session.error = err;
            return res.redirect('/reg');
        }
        if (err) {
            console.log("Error in get user : " + err);
            req.session.error = err;
            return res.redirect('/reg');
        }
        //如果不存在则新增用户
        User.save(newUser,function(err,doc) {
            if (err) {
                console.log("Error in save user : " + err);
                req.session.error = err;
                return res.redirect('/reg');
            }
            console.log(doc, " saved ");
            req.session.user = newUser;
            req.session.success = '注册成功';
            res.redirect('/');
        });
    });
    console.log("finish register users..");
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res) {
    res.render('login', {
      title: '用戶登入',
    });
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res) {
    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    
    User.get(req.body.username, function(err, user) {
      if (!user) {
        req.session.error = '用戶不存在';
        return res.redirect('/login');
      }
      if (user.password != password) {
        req.session.error = '用戶口令錯誤';
        return res.redirect('/login');
      }
      req.session.user = user;
      req.session.success = '登入成功';
      if (req.session.originalUrl) {
        res.redirect(req.session.originalUrl);
        delete req.session.originalUrl;
      } else {
        res.redirect('/users/'+user._id +'/posts');
      }
    });
  });
  
router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
    req.session.user = null;
    req.session.success = '登出成功';
    res.redirect('/');
});
  
router.get('/users', checkLogin);
router.get('/users', function(req, res) {
  mdoc.find('users', null, function(err,users){
    res.render('users', {
      title: '用户列表',
      users: users
    });
  });
});

router.get('/users/:id/posts', function(req, res) {
  var id = req.params.id;
  mdoc.findOne('users', {_id:new ObjectID(id)} ,function(err, userDoc) {
    if(!userDoc){
      userDoc = {name:"Not Found", email:"So I don't know"};
    }
    mdoc.find('posts', {user: id}, {time:-1},function(err, posts) {
      if (err) {
        req.session.error = err;
        return res.redirect('/');
      }
      res.render('userposts', {
        qUser: userDoc,
        title: '用户文章',
        posts: posts,
      });
    });
  });
});

router.get('/posts', checkLogin);
//router.all('/posts/*', checkLogin);

router.get('/:resource([a-z]+s)/new', function(req, res) {
  var resource = req.params.resource;
  res.render(resource.slice(0,-1)+ '_new', {
    title: 'new '+ resource,
  });
});

function updateDoc(req,res){
  var doc = req.body;
  console.log("put method modified data",doc);
  var resource = req.params.resource;
  var id = req.params.docId;
  if (resource == 'users'){
    doc.avatar = gravatar.url(req.body.email);
  }
  mdoc.updateById(id, resource,doc,function(err,doc){
    if (err) {
      req.session.error = err.message;
      return res.redirect(req.originalUrl);
    }
    req.session.success = '修改成功';
    res.redirect('/' + resource + '/' + id);
  });
}

//RESTFUL API update
router.put('/:resource([a-z]+s)/:docId([a-f0-9]+)', updateDoc);

//show resource
router.get('/:resource([a-z]+s)/:docId([a-f0-9]+)', function(req, res) {
  console.log('in router get method /resource/docId');
  var resource = req.params.resource;
  mdoc.findById(req.params.docId, resource, function(err, doc){
    if (err) {
      console.log(err);
      throw new Error("can not found resource "+ resource +" with id " + req.params.docId);
    }
    if (!doc) {
      req.session.error = resource.slice(0,-1) + ' does not exists';
      return res.redirect('/');
    }
    // only for posts to count click.
    if (resource == 'posts') {
      if (doc.pv) {
        doc.pv = doc.pv + 1;
      } else {
        doc.pv = 1;
      }
      mdoc.updateById(doc._id, resource, doc, function(err,doc){
        if (err) {
          throw err;
        }
      });
      
    }
    res.render(resource.slice(0,-1), {
      title: doc.title,
      doc: doc
    });
  });
});

//edit resource
router.get('/:resource([a-z]+s)/:docId([a-f0-9]+)/edit', function(req, res) {
  var resource = req.params.resource;
  mdoc.findById(req.params.docId, resource, function(err, doc){
    res.render(resource.slice(0,-1)+'_edit', {
      title: 'edit',
      doc: doc
    });
  });
});

router.post('/:resource([a-z]+s)/:docId([a-f0-9]+)/edit', updateDoc);

router.post('/posts/:docId([a-f0-9]+)/comments', function(req,res){
 
  var id = req.params.docId;
  var body = req.body;
  var newComment = {
    name: body.name,
    avatar: gravatar.url(body.email),
    email: body.email,
    website: body.website,
    time: new Date(),
    content: body.content
  };
  Post.comments(id, newComment,function(err,doc){
    if (err) {
      req.session.error = err.message;
      return res.redirect(req.originalUrl);
    }
    res.redirect('/posts/' + id);
  });
});

function delDoc(req, res){
  var resource = req.params.resource;
  var id = req.params.docId;
  console.log('delete doc',id);
  mdoc.findById(id, resource, function(err,doc){
    if (!doc) {
      throw new Error("no resource with id : " + id + "to be deleted.");
    } else {
      mdoc.delById(id, resource, function (err,doc) {
        console.log(doc.deletedCount + 'document deleted.');
        req.session.success = 'successfully deleted.';
        res.redirect('/');
      });
    }
  });
}

router.get('/:resource([a-z]+s)/:docId([a-f0-9]+)/delete', delDoc);

//delete resource
// RESTFUL API delete
router.delete('/:resource([a-z]+s)/:docId([a-f0-9]+)', delDoc);

//new resource
router.post('/posts', checkLogin);
router.post('/posts', function(req, res) {
    var user = req.session.user;
    var post = req.body;
    post.tags;
    console.log(post, "post data to /posts ??? ");

    Post.save(user, post, function(err, doc) {
      if (err) {
        req.session.error = err;
        return res.redirect(req.originalUrl);
      }
      req.session.success ='發表成功';
      res.redirect('/users/' + user._id + '/posts');
    });
});

  
function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.session.originalUrl = req.originalUrl;
    req.session.error = '未登入';
    return res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.session.error = '已登入';
    return res.redirect('/');
  }
  next();
}

module.exports = router;
