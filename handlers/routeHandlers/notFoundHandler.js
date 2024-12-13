/*
 * Title: Not Found Handler
 * Description: Not Found Handler Function
 * Author: Nadman Alvee
 * Date: 11/19/2024
*/

// module scaffolding
const handler = {};

handler.notFoundHandler = (requestObjects, callback)=>{
    // console.log(requestObjects);

    callback(404, {
        message : "URL not found",
    });
};

module.exports = handler;