/*
 * Title: Check Handler
 * Description: Check Request Handler Function
 * Author: Nadman Alvee
 * Date: 12/1/2024
*/

// dependencies
const CRUD = require('../../lib/data');
const { parseJSON,generateToken } = require('../../helpers/utilities');
const tokenHandler = require('../../handlers/routeHandlers/tokenHandler');
const { maxChecks } = require('./../../helpers/environments');
const { user } = require('../../routes');

// module scaffolding
const handler = {};
handler._check = {};

handler.checkHandler = (requestObjects, callback)=>{
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestObjects.method) > -1){
        handler._check[requestObjects.method](requestObjects, callback);  //handler._check['post']() === handler._check.post()
    }else{
        callback(405, {
        message: "Action not permisible",   
        });
    }
};

handler._check.post = (requestObjects, callback)=>{
    // < validating inputs >
    let protocol = typeof(requestObjects.body.protocol) ==='string' && ['http', 'https'].indexOf(requestObjects.body.protocol) > -1 
        ? requestObjects.body.protocol : false;

    let url = typeof(requestObjects.body.url) ==='string' && requestObjects.body.url.trim().length > 0 
        ? requestObjects.body.url : false;

    let method = typeof(requestObjects.body.method) ==='string' && ['get', 'post', 'put', 'delete'].indexOf(requestObjects.body.method.toLowerCase()) > -1 
        ? requestObjects.body.method : false;
    
    let successCodes = typeof(requestObjects.body.successCodes) ==='object' && requestObjects.body.successCodes instanceof Array 
        ? requestObjects.body.successCodes : false;

    let timeoutSeconds = typeof(requestObjects.body.timeoutSeconds) ==='number' && requestObjects.body.timeoutSeconds % 1 === 0 && requestObjects.body.timeoutSeconds >= 1
        && requestObjects.body.timeoutSeconds <= 5
        ? requestObjects.body.timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds){
        let token = typeof(requestObjects.headersObject.token) === 'string'
            ? requestObjects.headersObject.token : false;

        // look up the user's Phone by the token
        CRUD.read('tokens', token, (errRead, tokenData)=>{
            if(!errRead && tokenData){
                let userPhone = parseJSON(tokenData).phone;
                // lookup the userData
                CRUD.read('users', userPhone, (errRead2, userData)=>{
                    if(!errRead2 && userData){
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid)=>{
                            if(tokenIsValid){
                                let userObject = parseJSON(userData);
                                let UserChecks = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ?
                                    userObject.checks : [];
                                if(UserChecks.length < maxChecks){
                                    let checkId = generateToken(20);
                                    let checkObject = {
                                        'id': checkId,
                                        'userPhone': userPhone,
                                        'protocol': protocol,
                                        'url': url,
                                        'method': method,
                                        'successCodes': successCodes,
                                        'timeoutSeconds': timeoutSeconds
                                    };
                                    // save the object
                                    CRUD.create('checks', checkId, checkObject, (errCreate)=>{
                                        if(!errCreate){
                                            // add checkid to user oibject
                                            userObject.checks = UserChecks;
                                            userObject.checks.push(checkId);
                                            // save the new userData
                                            CRUD.update('users', userPhone, userObject, (errUpdate)=>{
                                                if(!errUpdate){
                                                    // return the data about new check
                                                    callback(200, checkObject);
                                                }else{
                                                    callback(500,{
                                                        'error': 'There was a problem in server side!'
                                                    });
                                                }
                                            });
                                        }else{
                                            callback(500,{
                                                'error': 'There was a problem in server side!'
                                            });
                                        }
                                    });
                                }else{
                                    callback(401, {
                                        'error': 'User has already reached max check limit!'
                                    }); 
                                }
                            }else{
                                callback(403, {
                                    'error': 'Authentication Failure!'
                                });
                            }
                        });
                    }else{
                        callback(404, {
                            'error': 'An unexpected error occured!'
                        });
                    }
                });
            }else{callback(403, {
                'error': 'Authentication Failure!'
            })};
        });
    }else{
        callback(400, {
            'error': 'There was a problem in your request!'
        });
    }
};

handler._check.get = (requestObjects, callback)=>{
    const checkId = typeof requestObjects.queryStreamObject.id === 'string' &&
    (requestObjects.queryStreamObject.id.trim().length) === 20 
        ? requestObjects.queryStreamObject.id : false;
    if(checkId){
        // search the check id
        CRUD.read('checks', checkId, (errRead, file)=>{
            if(!errRead && file){
                let token = typeof(requestObjects.headersObject.token) === 'string'
                ? requestObjects.headersObject.token : false;
                tokenHandler._token.verify(token, parseJSON(file).userPhone, (tokenIsValid)=>{
                    if(tokenIsValid){
                        callback(200, parseJSON( file ));
                    }else{
                        callback(403, {
                            'error': 'Authentication Failure!'
                        });
                    }
                });         
            }else{
                callback(500,{
                    'error': 'There was a problem in server side!'
                });
            };
        });
    }else{
        callback(400, {
            error: 'You have a problem in your request'
        });
    }
};

handler._check.put = (requestObjects, callback)=>{
    // < validating inputs >
    const checkId = typeof requestObjects.body.id === 'string' &&
    (requestObjects.body.id.trim().length) === 20 
        ? requestObjects.body.id : false;
    if(checkId){
        // search the check id
        CRUD.read('checks', checkId, (errRead, file)=>{
            if(!errRead && file){
                let token = typeof(requestObjects.headersObject.token) === 'string'
                ? requestObjects.headersObject.token : false;
                tokenHandler._token.verify(token, parseJSON(file).userPhone, (tokenIsValid)=>{
                    if(tokenIsValid){
                        let protocol = typeof(requestObjects.body.protocol) ==='string' && ['http', 'https'].indexOf(requestObjects.body.protocol) > -1 
                            ? requestObjects.body.protocol : false;

                        let url = typeof(requestObjects.body.url) ==='string' && requestObjects.body.url.trim().length > 0 
                            ? requestObjects.body.url : false;

                        let method = typeof(requestObjects.body.method) ==='string' && ['get', 'post', 'put', 'delete'].indexOf(requestObjects.body.method.toLowerCase()) > -1 
                            ? requestObjects.body.method : false;
                        
                        let successCodes = typeof(requestObjects.body.successCodes) ==='object' && requestObjects.body.successCodes instanceof Array 
                            ? requestObjects.body.successCodes : false;

                        let timeoutSeconds = typeof(requestObjects.body.timeoutSeconds) ==='number' && requestObjects.body.timeoutSeconds % 1 === 0 && requestObjects.body.timeoutSeconds >= 1
                            && requestObjects.body.timeoutSeconds <= 5
                            ? requestObjects.body.timeoutSeconds : false;

                        if(protocol || url || method || successCodes || timeoutSeconds){
                            let checkObject = parseJSON( file );
                            if(protocol){
                                checkObject.protocol = protocol;
                            }
                            if(url){
                                checkObject.url = url;
                            }
                            if(method){
                                checkObject.method = method;
                            }
                            if(successCodes){
                                checkObject.successCodes = successCodes;
                            }
                            if(timeoutSeconds){
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }
                            // Store the new check object
                            CRUD.update('checks', checkId, checkObject, (errUpdate)=>{
                                if(!errUpdate){
                                    callback(200);
                                }else{
                                    callback(500, {
                                        'message': 'Failed to update check!'
                                    });
                                }
                            });
                        }else{
                            callback(400, {
                                error: 'You must provide at least one field to update'
                            });
                        }
                    }else{
                        callback(403, {
                            'error': 'Authentication Failure!'
                        });
                    }
                });         
            }else{
                callback(500,{
                    'error': 'There was a problem in server side!'
                });
            };
        });
    }else{
        callback(400, {
            error: 'You have a problem in your request'
        });
    }
};

handler._check.delete = (requestObjects, callback)=>{
    const checkId = typeof requestObjects.queryStreamObject.id === 'string' &&
    (requestObjects.queryStreamObject.id.trim().length) === 20 
        ? requestObjects.queryStreamObject.id : false;
    if(checkId){
        // search the check id
        CRUD.read('checks', checkId, (errRead, file)=>{
            if(!errRead && file){
                let token = typeof(requestObjects.headersObject.token) === 'string'
                ? requestObjects.headersObject.token : false;
                tokenHandler._token.verify(token, parseJSON(file).userPhone, (tokenIsValid)=>{
                    if(tokenIsValid){
                        CRUD.delete('checks', checkId, (errDelete)=>{
                            if(!errDelete){
                                let number =  parseJSON(file).userPhone;
                                CRUD.read('users', number, (errRead, userData)=>{
                                    if(!errRead && userData){
                                        let userObject = parseJSON(userData);
                                        let checkIndex = userObject.checks.indexOf(checkId);
                                        if(checkIndex > -1){
                                            userObject.checks.splice(checkIndex, 1);
                                            // save the check
                                            CRUD.update('users', number, userObject, (errUpdate)=>{
                                                if(!errUpdate){
                                                    callback(200);
                                                }else{
                                                    callback(500,{
                                                        'error': 'There was a problem in server side!'
                                                    });
                                                }
                                            })
                                        }else{
                                            callback(500,{
                                            'error': 'Provided check was not found!'
                                            });
                                        }
                                    }else{
                                        callback(500,{
                                            'error': 'There was a problem in server side!'
                                        });
                                    }
                                })
                                // callback(200,{
                                //     'message': 'check deleted successfully'
                                // });
                            }else{
                                callback(500,{
                                    'message': 'check could not delete. Error code: 500'
                                });
                            }
                        });
                    }else{
                        callback(403, {
                            'error': 'Authentication Failure!'
                        });
                    }
                });         
            }else{
                callback(500,{
                    'error': 'There was a problem in server side!'
                });
            };
        });
    }else{
        callback(400, {
            error: 'You have a problem in your request'
        });
    }
};


module.exports = handler;
