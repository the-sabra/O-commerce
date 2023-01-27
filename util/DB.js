require('dotenv/config');
const mongodb=require('mongodb');
const mongoClient=mongodb.MongoClient;
require('dotenv/config')

let _db;
const mongoConnect=(callback)=>{
<<<<<<< HEAD
 mongoClient.connect(process.env.MONGODB_URL)
=======
 mongoClient.connect(process.env.MONGO_URL)
>>>>>>> e41c9fd1f3c7b34be434c413b6f3b75730811554
     .then((res)=>{
         console.log('Connected');
         _db=res.db()
         callback();
     })
     .catch(
         err=>{
               console.log(err);
               throw err;
         }
     )
}
const getDb=()=>{
    if(_db){
        return _db;
    }else{
        console.log('Not DB found');
    }
}
exports.mongoConnect=mongoConnect;
exports.getDb=getDb;