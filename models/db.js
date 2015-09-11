var MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb://localhost:27017/microblog', function(err, database) {
    if(err) throw err
    GLOBAL.db = database
    console.log(" ********************  database should only connect at application start.")
})


