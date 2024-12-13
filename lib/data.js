// dependencies
const fs = require('fs');
const path = require('path');

// app object - module scaffolding
const lib = {};

// base directory of data folder
lib.basedir = path.join(__dirname, '/../data/');

// write function
lib.create = function(dir, fileName, data, callback){
    // open file to write
    fs.open(`${lib.basedir}/${dir}/${fileName}.json`, 'wx', (errorFsOpen, fileDescriptor)=>{
        if(!errorFsOpen && fileDescriptor){
            // converting data to string
            const stringData = JSON.stringify(data);

            // writing data to file
            fs.writeFile(fileDescriptor, stringData, (errorFsWrite)=>{
                if(errorFsWrite){
                    callback(errorFsWrite+' Could not write to file!');
                }else{
                    fs.close(fileDescriptor, (errorFsClose)=>{
                        if(errorFsClose){
                            callback('error closing file!', errorFsClose);
                        } else {
                            callback(null);
                        }
                    });
                }
            });
        }
        else{
            callback(errorFsOpen);
        }
    })
};

// read function
lib.read = function(dir, fileName, callback) {
    fs.readFile(lib.basedir + '/' + dir + '/' + fileName + '.json', 'utf-8', (errorFsRead, data) => {
        if (!errorFsRead && data) {
            callback(null, data);
        } else {
            callback(errorFsRead, null);
        }
    });
};


// update existing file
lib.update = function(dir, fileName, data, callback){
    //open file for updating
    fs.open(`${lib.basedir}/${dir}/${fileName}.json`, 'r+', (errorFsOpen, fileDescriptor)=>{
        if(!errorFsOpen && fileDescriptor){
            // converting data to string
            const stringData = JSON.stringify(data);

            // truncate the file
            fs.ftruncate(fileDescriptor, (errroFsTruncate)=>{
                if(!errroFsTruncate){
                    // Write to file and close it
                    fs.writeFile(fileDescriptor, stringData, (errorFsWrite)=>{
                        if(errorFsWrite){
                            callback(errorFsWrite+' Could not write to file!');
                        }else{
                            fs.close(fileDescriptor, (errorFsClose)=>{
                                if(errorFsClose){
                                    callback('error closing file!', errorFsClose);
                                } else {
                                    callback(null);
                                }
                            });
                        };
                    });
                }else{
                    callback(errroFsTruncate);
                }
            });

        }else{
            callback(errorFsOpen);
        }
    });
};

// delete existing file
lib.delete = function(dir, fileName, callback){
    // unlink file
    fs.unlink(`${lib.basedir}/${dir}/${fileName}.json`, (errorFsUnlink)=>{
        if(errorFsUnlink){
            callback('Could not delete the file. ',errorFsUnlink);
        } else {
            callback(null);
        }
    });
};

module.exports = lib;


