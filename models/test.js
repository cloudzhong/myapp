var obj = require('./MongoDoc')

/*
obj.findOne('part', {name: '100000004'}, function(err,doc){
     console.log('**********************  Found : \n',doc)
})
*/

var modified = {type:'Color Part', name:'123456789',revision:'002',description:'test three'}
obj.update( modified, {col:'part', index:'name', criteria:{name:'123456789'}}, function(err,doc){
    console.log('***********************   Updated Document:   \n',doc)
})

obj.search('part',{name:'100000004'},function(err,data){
    for(var i=0; i< data.length; i++){
        console.log('name: ', data[i].name)
    }
})

obj.del('part',{name:'100000004'},function(err,data){
    console.log("deleted : ",data)
})