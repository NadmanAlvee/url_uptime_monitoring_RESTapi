/*
 * Title: Notifications Library
 * Description: function to notify users
 * Author: Nadman Alvee
 * Date: 12/13/2024
*/

// dependencies
const https = require('https');
const quesryString = require('querystring');
const {twilio} = require('./environments');

// module scaffolding
const notifications = {};

// send sms to users using twilio API
notifications.sendTwilioSms = (phone, msg, callback) => {
    // input validation
    const userPhone = typeof(phone) === 'string' && phone.trim().length === 11
        ? phone.trim() : false;

    const userMsg = typeof(msg) === 'string' && msg.trim().length <= 1600
        ? msg.trim() : false;

    if(userPhone && userMsg){
        // config the request payload
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        }

        // stringify the file for twilio
        const stringifyPayload = quesryString.stringify(payload);

        // config the req details
        let options = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/$Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        // send request object via https 
        const req = https.request(options, (res)=>{
            const status = res.statusCode;
            // callback successfully if the req went through
            if(status == 200 || status == 201){
                callback(false);
            }else{
                callback(`Status code returned was ${status}`);
            }

            res.on('error', (e)=>{
                callback(e);
            });

            res.write(stringifyPayload);
            res.end();
        });
    }else{
        callback('Given parameters were missing or invalid');
    }
}

// export the module
module.exports = notifications;
