const fs =require('fs');

const delecteFile=(path)=>{
    fs.unlink(path,err => {
        if(err){
            throw err;
        }
    });
}
exports.delecteFile=delecteFile;