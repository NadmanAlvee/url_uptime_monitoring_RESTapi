/*
 * Title: Toekn Handler
 * Description: Token Handler Function
 * Author: Nadman Alvee
 * Date: 11/30/2024
*/

// dependencies
const lib = require('../../lib/data');
const {parseJSON} = require('../../helpers/utilities');
const {hash} = require('../../helpers/utilities');
const {generateToken} = require('../../helpers/utilities');


// module scaffolding
const handler = {};
handler._token = {};

handler.tokenHandler = (requestObjects, callback)=>{
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestObjects.method) > -1){
        handler._token[requestObjects.method](requestObjects, callback);
    }else{
        callback(405, {
        message: "Action not permisible",
        });
    }
};

handler._token.post = (requestObjects, callback)=>{
    // Checking Inputs
    const phone = typeof requestObjects.body.phone === 'string' &&
    (requestObjects.body.phone.trim().length) === 11 
        ? requestObjects.body.phone
        : false;
    const password = typeof requestObjects.body.password === 'string' &&
    (requestObjects.body.password.trim().length) > 0
        ? requestObjects.body.password 
        : false;
    if(phone && password){
        // matching the given phone & password
        lib.read('users', phone, (errRead, file)=>{
            if(!errRead && file){
                const userData = {...parseJSON(file)};
                let passwd = hash(password);
                if(userData.password === passwd){

                    // creating token object
                    let tokenID = generateToken(20);
                    let expires = Date.now() + (60*60*1000);
                    let tokenObject = {
                        'id': tokenID,
                        phone,
                        expires
                    }

                    // saving the token in database
                    lib.create('tokens', tokenID, tokenObject, (errWrite)=>{
                        if(!errWrite){
                            callback(200, {
                                message: "token generated successfully"
                            })
                        }else{
                            callback(500, {
                                error: "there was a problem!"
                            })
                        }
                    })
                }else{
                    callback(400, {
                        error: "You have a problem in your request!"
                    })
                }
            }else{
                callback(500, {
                    error: "there was a problem!"
                })
            }
        });
    }else{
        callback(400, {
            error: "You have a problem in your request!"
        })
    }
};

handler._token.get = (requestObjects, callback)=>{
    // check if the id is valid
    const id = typeof requestObjects.queryStreamObject.id === 'string' &&
    (requestObjects.queryStreamObject.id.trim().length) === 20 
        ? requestObjects.queryStreamObject.id : false;

    if(id){
        // search the id
        lib.read('tokens', id, (errRead, file)=>{
            if(!errRead && file){
                let tokenObject = { ...parseJSON(file)}
                callback(200, {
                    tokenObject,
                })
            }else{
                callback(404, {
                    "error": "requested token was not found!",
                })
            }
        })
    }else{
        callback(404, {
            "error": "requested token was not found!",
        })
    }
};

handler._token.put = (requestObjects, callback)=>{
    // Checking token id & request
    const id = typeof requestObjects.body.id === 'string' &&
    (requestObjects.body.id.trim().length) === 20 
        ? requestObjects.body.id
        : false;
    const extend = typeof requestObjects.body.extend === 'boolean'
        ? requestObjects.body.extend 
        : false;
    if(id && extend){
        lib.read('tokens', id, (err, file)=>{
            let tokenObject = {...parseJSON(file)};
            if(tokenObject.expires > Date.now()){
                tokenObject.expires = Date.now() + (60 * 60 * 1000);
                // store the updated token in database
                lib.update('tokens', id, tokenObject, (errUpdate)=>{
                    if(!errUpdate){
                        callback(200);
                    }else{
                        callback(500, {
                            error: "there was a problem!"
                        });
                    }
                })

            }else{
                callback(400, {
                    error: "Token already expired!"
                });
            }
        })
    }else{
        callback(400, {
            error: "You have a problem in your request!"
        });
    }
};

handler._token.delete = (requestObjects, callback)=>{
    const id = typeof requestObjects.queryStreamObject.id === 'string' &&
    (requestObjects.queryStreamObject.id.trim().length) === 20 
        ? requestObjects.queryStreamObject.id : false;
    if(id){
        // user lookup
        lib.read('tokens', id, (errRead, file)=>{
            if(!errRead && file){
                lib.delete('tokens', id, (errDelete)=>{
                    if(!errDelete){
                        callback(200, {
                            "message": "Token deleted successfully",
                        });
                    } else{
                        callback(500, {
                            error: "there was a problem in server side."
                        });
                    }
                })
                
            }else{
                callback(404, {
                    "error": "token id not found!",
                });
            }
        })
    }else{
        callback(404, {
        error: "User not Found",
        });
    }
};

handler._token.verify = (id, phone, callback) => {
    lib.read('tokens', id, (error, tokenFile) => {
        if (!error && tokenFile) {
            const parsedToken = parseJSON(tokenFile);
            if (parsedToken.phone === phone && parsedToken.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = handler;
