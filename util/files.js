const fs =require('fs');

const deleteFile=(path)=>{
    fs.unlink(path,err => {
        if(err){
            throw err;
        }
    });
    console.log('File Deleted successfully')
}
exports.deleteFile=deleteFile;