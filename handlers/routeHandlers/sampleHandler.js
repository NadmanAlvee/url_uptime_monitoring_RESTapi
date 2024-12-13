/*
 * Title: Sample Handler
 * Description: Sample Handler Function
 * Author: Nadman Alvee
 * Date: 11/19/2024
*/

// module scaffolding
const handler = {};

handler.sampleHandler = (requestObjects, callback)=>{
    // console.log(requestObjects);
    callback(200, {
        message: "this is smaple url",
    });
};

module.exports = handler;
