var express = require('express');
var crypto = require('crypto');
var Post = require('../models/post');
var User = require('../models/user.js');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    Post.get(null, function(err, posts) {
      if (err) {
        posts = [];
      }
      res.render('index', {
        title: '首頁',
        posts: posts,
      });
    });
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res) {
    res.render('reg', {title: '用户注册' })
    res.end
})

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res) {
    console.log("before register users..")
    //检验用户两次输入的口令是否一致
    if (req.body['password-repeat'] != req.body['password']) {
        req.session.error = '两次输入的口令不一致';
        return res.redirect('/reg');
    }

    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var newUser = {
        name: req.body.username,
        password: password,
    };
    
    //检查用户名是否已经存在
    User.get(newUser.name, function(err, user) {
        if (user) {
            err = 'Username already exists.';
            console.log("User already exists : " + err)
            req.session.error = err;
            return res.redirect('/reg');
        }
        if (err) {
            console.log("Error in get user : " + err)
            req.session.error = err;
            return res.redirect('/reg');
        }
        //如果不存在则新增用户
        User.save(newUser,function(err,doc) {
            if (err) {
                console.log("Error in save user : " + err)
                req.session.error = err;
                return res.redirect('/reg');
            }
            console.log(doc, " saved ")
            req.session.user = newUser;
            req.session.success = '注册成功';
            res.redirect('/');
        });
    });
    console.log("finish register users..")
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
      res.redirect('/users/'+user.name);
    });
  });
  
router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
    req.session.user = null;
    req.session.success = '登出成功';
    res.redirect('/');
});
  
router.get('/users/:user', function(req, res) {
    User.get(req.params.user, function(err, user) {
      if (!user) {
        req.session.error = '用戶不存在';
        return res.redirect('/');
      }
      Post.get(user.name, function(err, posts) {
        if (err) {
          req.session.error = err;
          return res.redirect('/');
        }
        res.render('user', {
          title: user.name,
          posts: posts,
        });
      });
    });
});

router.get('/posts', checkLogin);
router.get('/posts', function(req, res) {
    res.render('post', {
      title: '發表博客',
    });
});

router.post('/posts', checkLogin);
router.post('/posts', function(req, res) {
    var user = req.session.user;
    var post = req.body;
    
    console.log(post, "post data to /posts ??? ")

    Post.save(user, post, function(err, doc) {
      if (err) {
        req.session.error = err;
        return res.redirect('/');
      }
      req.session.success ='發表成功';
      res.redirect('/users/' + user.name);
    });
});

router.post('/post', checkLogin);
router.post('/post', function(req, res) {
    var currentUser = req.session.user;
    var post = req.body;
    Post.save(function(err) {
      if (err) {
        req.session.error = err;
        return res.redirect('/');
      }
      req.session.success ='發表成功';
      res.redirect('/users/' + currentUser.name);
    });
});
  
function checkLogin(req, res, next) {
  if (!req.session.user) {
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
