const fs =require('fs');

const delecteFile=(path)=>{
    fs.unlink(path,err => {
        if(err){
            throw err;
        }
    });
    console.log('File Deleted successfully')
}
exports.delecteFile=delecteFile;