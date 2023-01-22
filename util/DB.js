require('dotenv/config');
const mongodb=require('mongodb');
const mongoClient=mongodb.MongoClient;
let _db;
const mongoConnect=(callback)=>{
 mongoClient.connect(process.env.MONGODB_URL)
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