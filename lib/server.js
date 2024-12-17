/*
 * Title: Server library
 * Description: Server related files
 * Author: Nadman Alvee
 * Date: 12/17/2024
*/

// dependencies
const http = require('http');
const {handleReqRes} = require('./../helpers/handleReqRes');
const environment = require('./../helpers/environments');

// app object - module scaffolding
const server = {};

// create server
server.createServer = function(){
    const createServerVariable = http.createServer(server.handleReqRes); // app.handle will handle req res from server
    createServerVariable.listen(environment.port, ()=>{
        console.log(`listeing to port ${environment.port}`); // listening to the port of corresponding environment
    });
};

// handle req res
server.handleReqRes = handleReqRes;

// initialize the server
server.init = ()=>{
    server.createServer();
}

// export the server
module.exports = server;
