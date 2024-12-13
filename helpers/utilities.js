/*
 * Title: Utilities
 * Description: Utilities Functions
 * Author: Nadman Alvee
 * Date: 11/23/2024
*/

// dependencies
const crypto = require('crypto');
const env = require('./environments');

// module scaffolding
const utilities = {};

// hashing
utilities.hash = (str)=>{
    if(typeof(str)==='string' && str.length > 0){
        const hash = crypto
            .createHmac('sha256', env.secretKey)
            .update(str)
            .digest('hex');
        return hash;
    }else{
        return false;
    }
};

// parse JSON String to Object
utilities.parseJSON = (jsonString)=>{
    let output;
    try{
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }
    return output;
};

// Generate a random string of given length
utilities.generateToken = (len)=>{
    let token ='';
    const alphabets = "abcdefghijklmnopqrstuvwxyz1234567890";
    let Length = (typeof(len) === 'number') && (len > 0) ? len : false;
    if(Length){          
        for(let i = 1; i <= Length; i++){
            token += alphabets[Math.floor(Math.random()*alphabets.length)];
        }
    }
    return token || null;
}

// export module
module.exports = utilities;
