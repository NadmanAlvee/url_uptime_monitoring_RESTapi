/*
 * Title: initial project file
 * Description: initial file to start the node server and background process 
 * Author: Nadman Alvee
 * Date: 12/17/2024
*/

// dependencies
const server = require('./lib/server');
const workers = require('./lib/worker');

// app object - module scaffolding
const app = {};

app.init = ()=>{
    // start the server
    server.init();
    // start the workers
    workers.init();
}

app.init();

// export the module
module.exports = app;
