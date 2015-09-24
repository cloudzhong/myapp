var obj = require('./MongoDoc')


var MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb://localhost:27017/plm', function(err, database) {
    if (err) throw err
    db = database;

    var modified = {
        type: 'Mechincal Part',
        name: '000000003',
        revision: '002',
        description: 'test insert'
    }

    obj.createIndex("parts", {"type":1, "name":1, "revision":1} , true);
    obj.save("parts", modified,  function(err, doc) {
        if (err) {
            console.log(err)
        }
        
    console.log(" part saved")
    })


})
