/*
 * Title: Workers library
 * Description: Worker related files
 * Author: Nadman Alvee
 * Date: 12/17/2024
*/

// dependencies
const url = require('url');
const { parseJSON } = require('../helpers/utilities');
const { sendTwilioSms } = require('./../helpers/notifications');
const CRUD = require('./data');
const http = require('http');
const https = require('https');

// app object - module scaffolding
const worker = {};

// initialize workers
worker.init = ()=>{
    // executes all the checks
    worker.gatherAllChecks();

    // call the loop of checks
    worker.loopChecks();
}

// initialize all checks
worker.gatherAllChecks = ()=>{
    // get all the checks
    CRUD.list('checks', (err, checks)=>{
        if(!err && checks && checks.length > 0){
            checks.forEach(check => {
                // read the check data
                CRUD.read('checks', check, (errRead, originalCheckData)=>{
                    if(!errRead && originalCheckData){
                        // pass the data to next
                        worker.validateCheckData(parseJSON(originalCheckData));

                    }else{
                        console.log('Error!');
                    }
                })
            });
        }else{
            console.log(err);
        }
    });
}

// validate individual check data
worker.validateCheckData = (originalData)=>{
    let originalCheckData = originalData
    if(originalCheckData && originalCheckData.id){
        originalCheckData.state = typeof(originalCheckData.state) === 'string'
        && ['up', 'down'].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state : 'down';

        originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) === 'number'
        && originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked : false;

        // pass to the next process
        worker.performCheck(originalCheckData);
    } else{
        console.log('check was invalid!')
    }
};

// perform check
worker.performCheck = (originalCheckData)=>{
    // prepare the initial check outcome
    let checkOutCome = {
        'error': false,
        'responseCode': false
    };
    // mark the outcome has not been sent yet
    let outcomeSent = false;

    // parse the hostname & full url
    let parsedUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true);
    let hostname = parsedUrl.hostname;
    let path = parsedUrl.path;

    // construct the request
    const requestDetails = {
        'protocol' : originalCheckData.protocol + ':',
        'hostname' : hostname,
        'method' : originalCheckData.method.toUpperCase(),
        'path' : path,
        'timeout': originalCheckData.timeoutSeconds * 1000
    };

    const Protocol = requestDetails.protocol === 'http' ? 'http' : 'https';
    let req = Protocol.request(requestDetails, (res)=>{
        // get the status code of response
        const status = res.statusCode;
        
        // update the check outcome & pass to the next
        checkOutCome.responseCode = status;

        if(!outcomeSent){
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        };
    });

    req.on('error', (e)=>{
        checkOutCome = {
            'error': true,
            'value': e
        };

        if(!outcomeSent){
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        };
    });

    req.on('timeout', (e)=>{
        checkOutCome = {
            'error': true,
            'value': 'timeout'
        };

        if(!outcomeSent){
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        };
    });

    // req send
    req.end();
};

// save check outcome to database and send to next process
worker.processCheckOutcome = (originalCheckData,checkOutCome)=>{
    // check if url is up or down
    let state = !checkOutCome.error && checkOutCome.responseCode && originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1
    ? 'up' : 'down';

    // check if it changed
    let alertWanted = originalCheckData.lastChecked && originalCheckData.state != state ? true : false;
    // update the check data
    let newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // update the check
    CRUD.update('checks', newCheckData.id. newCheckData, (err)=>{
        if(!err){
            if(alertWanted){
                // send the check data to next process
                worker.alertUserToStatusChange(newCheckData);
            }else{
                console.log('Alert is not needed as there is no state change!');
            }
        }else{
            console.log('Error saving the check data!');
        }
    });
};

// notify the user
worker.alertUserToStatusChange = (newCheckData)=>{
    let msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.userPhone, msg, (err)=>{
        if(!err){
            console.log(`User was notified! SMS: ${msg}`);
        }else{
            console.log('There was a problem sending sms to user!');
        }
    });
};

// loop function
worker.loopChecks = ()=>{
    setInterval(worker.gatherAllChecks, 1000*60);
}

// export workers
module.exports = worker;
