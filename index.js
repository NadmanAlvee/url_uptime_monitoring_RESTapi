/*
 * Title: Uptime Monitoring Application
 * Description: A RESTFul API to monitor up or down time for user defined url
 * Author: Nadman Alvee
 * Date: 11/19/2024
*/

// dependencies
const http = require('http');
const {handleReqRes} = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');

// app object - module scaffolding
const app = {};


// create server
app.createServer = function(){
    const server = http.createServer(app.handleReqRes); // app.handle will handle req res from server

    server.listen(environment.port, ()=>{
        console.log(`listeing to port ${environment.port}`); // listening to the port of corresponding environment
    });
};

// handle req res
app.handleReqRes = handleReqRes;

// start the server
app.createServer();

//@ todo
const { sendTwilioSms } = require('./helpers/notifications');
sendTwilioSms('01763914143', 'Hello World', (err) => {
    console.log(err);
});