/*
 * Title: Handle Request Response
 * Description: Handle Request Response Function
 * Author: Nadman Alvee
 * Date: 11/19/2024
*/

// dependencies
const url = require('url');
const {StringDecoder} = require('string_decoder')
const Decoder = new StringDecoder('utf-8');
const routes = require('../routes');
const {notFoundHandler} = require('../handlers/routeHandlers/notFoundHandler');
const {parseJSON} = require('./utilities');

// module scaffolding
const handler = {};

handler.handleReqRes = function(req, res){
/*
    ReqProperties { 
    req.url,
    req.method,
    req.headers,    
    }
*/
    // request handling
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStreamObject = parsedUrl.query;
    const headersObject = req.headers;
    const requestObjects = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryStreamObject,
        headersObject,
    };
    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

    // requestObjects.body = realData;
    let realData = '';

    req.on('data', (buffer)=>{
        realData += Decoder.write(buffer);
    });

    req.on('end', ()=>{
        realData += Decoder.end();
        requestObjects.body = parseJSON(realData);
        
        chosenHandler(requestObjects, (statusCode, payload)=>{
            statusCode = typeof(statusCode) === 'number' ? statusCode : 500;
            payload = typeof(payload) === 'object' ? payload : {};

            const payloadString = JSON.stringify(payload);

            // Return the final response
            res.setHeader('content-type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            
        });

    });
}

module.exports = handler;