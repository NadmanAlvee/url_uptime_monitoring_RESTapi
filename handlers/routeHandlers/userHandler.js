/*
 * Title: User Handler
 * Description: User Request Handler Function
 * Author: Nadman Alvee
 * Date: 11/19/2024
*/

// dependencies
const CRUD = require('../../lib/data');
const {parseJSON} = require('../../helpers/utilities');
const {hash} = require('../../helpers/utilities');
const tokenHandler = require('../../handlers/routeHandlers/tokenHandler');


// module scaffolding
const handler = {};
handler._users = {};

handler.userHandler = (requestObjects, callback)=>{
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestObjects.method) > -1){
        handler._users[requestObjects.method](requestObjects, callback);
    }else{
        callback(405, {
        message: "Action not permisible",
        });
    }
};

handler._users.post = (requestObjects, callback)=>{
    // callback(200, requestObjects.body);
    const firstName = typeof requestObjects.body.firstName === 'string' && (requestObjects.body.firstName.trim().length) > 0 ? requestObjects.body.firstName : false;
    const lastName = typeof requestObjects.body.lastName === 'string' && (requestObjects.body.lastName.trim().length) > 0 ? requestObjects.body.lastName : false;
    const phone = typeof requestObjects.body.phone === 'string' && (requestObjects.body.phone.trim().length) === 11 ? requestObjects.body.phone : false;
    const password = typeof requestObjects.body.password === 'string' && (requestObjects.body.password.trim().length) > 0 ? requestObjects.body.password : false;
    const tosAgreement = typeof requestObjects.body.tosAgreement === 'boolean' ? requestObjects.body.tosAgreement : false;
    if(firstName && lastName && phone && password && tosAgreement){
        // checking if user already exists
        CRUD.read('users', phone, (readErr)=>{
            if(readErr){
                // create user
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                }
                CRUD.create('users', phone, userObject, (errCreate)=>{
                    if(errCreate){
                        callback(500, {'error': 'Could not create user!'});
                    }else{
                        callback(200, {'message': 'User created successfully!'});
                    }
                });
            } else{
                callback(500, {
                    "error": "there was a problem",
                })
            }
        });
    }else{
        callback(400, {
            error: 'Please try again!',
        });
    }
};

handler._users.get = (requestObjects, callback)=>{
    // check the phone Num is valid
    const phone = typeof requestObjects.queryStreamObject.phone === 'string' && (requestObjects.queryStreamObject.phone.trim().length) === 11 ? requestObjects.queryStreamObject.phone : false;
    if(phone){
        // <verify token>
        let token = typeof(requestObjects.headersObject.token) === 'string'
            ? requestObjects.headersObject.token : false;
        tokenHandler._token.verify(token, phone, (bool)=>{
            if(bool){
                // <user lookup>
                CRUD.read('users', phone, (error, file)=>{
                    if(!error && file){
                        let userData = { ...parseJSON(file)}
                        delete userData.password;
                        callback(200, {
                            userData,
                        });
                    }else{
                        callback(404, {
                            'error': "User not found!",
                        });
                    }
                });
                // </user lookup>
            }else{
                callback(403,{
                    'error': 'Authentication failure!'
                })
            }
        });
        // </verify token>
    }else{
        callback(404, {
            "error": "User not found!",
        })
    }
};

handler._users.put = (requestObjects, callback)=>{
    // checking the number's validity
    const firstName = typeof requestObjects.body.firstName === 'string' && (requestObjects.body.firstName.trim().length) > 0 ? requestObjects.body.firstName : false;
    const lastName = typeof requestObjects.body.lastName === 'string' && (requestObjects.body.lastName.trim().length) > 0 ? requestObjects.body.lastName : false;
    const phone = typeof requestObjects.body.phone === 'string' && (requestObjects.body.phone.trim().length) === 11 ? requestObjects.body.phone : false;
    const password = typeof requestObjects.body.password === 'string' && (requestObjects.body.password.trim().length) > 0 ? requestObjects.body.password : false;

    if(phone){
        if(firstName || lastName || password){
            // <verify token>
            let token = typeof(requestObjects.headersObject.token) === 'string'
            ? requestObjects.headersObject.token : false;
            tokenHandler._token.verify(token, phone, (bool)=>{
            if(bool){
                // <user lookup>
                CRUD.read('users', phone, (errRead, file)=>{
                    let userData = {...parseJSON(file)};
                    if(!errRead && userData){
                        if(firstName){
                            userData.firstName = firstName;
                        }
                        if(lastName){
                            userData.lastName = lastName;
                        }
                        if(password){
                            userData.password = hash(password);
                        }
                        // update database
                        CRUD.update('users', phone, userData, (errWrite)=>{
                            if(!errWrite){
                                callback(200, {
                                    "message": "user updated successfully",
                                });
                            }else{
                                callback(500, {
                                    error: "there was a problem in server side."
                                });
                            }
                        })
                    }else{
                        callback(404, {
                            error: "Not Found",
                        });
                    }
                });
                // </user lookup>
                }else{
                    callback(403,{
                        error: 'Authentication failure!'
                    });
                }
            });
            // </verify token>
        }else{
            callback(400, {
                error: "Problem in your request",
            });
        }
    }else{
        callback(400, {
            error: "Invalid phone number. Please try again!",
        })
    }
};

handler._users.delete = (requestObjects, callback)=>{
    const phone = typeof requestObjects.queryStreamObject.phone === 'string' && (requestObjects.queryStreamObject.phone.trim().length) === 11 ? requestObjects.queryStreamObject.phone : false;
    if(phone){
        // <verify token>
        let token = typeof(requestObjects.headersObject.token) === 'string'
            ? requestObjects.headersObject.token : false;
        tokenHandler._token.verify(token, phone, (bool)=>{
            if(bool){
                // <user lookup>
                CRUD.read('users', phone, (errRead, file)=>{
                if(!errRead && file){
                    CRUD.delete('users', phone, (errDelete)=>{
                        if(!errDelete){
                            callback(200, {
                                "message": "user deleted successfully",
                            });
                        } else{
                            callback(500, {
                                error: "there was a problem in server side."
                            });
                        }
                    })
                }else{
                    callback(404, {
                        "error": "User not found!",
                    });
                }
                })
                // </user lookup>
            }else{
                callback(403,{
                    error: 'Authentication failure!'
                })
            }
        });
        // </verify token>
    }else{
        callback(404, {
        error: "User not Found",
        });
    }
};


module.exports = handler;
