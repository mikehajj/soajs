'use strict';

var soajsRes = require("./response.js");

/**
 *
 * @param configuration
 * @returns {Function}
 */
module.exports = function (configuration) {
    return function (req, res, next) {
        if (!req.soajs) {
            req.soajs = {};
        }
        req.soajs.buildResponse = function (error, data) {
            var response = null;
            if (error) {
                response = new soajsRes(false);
                if (Array.isArray(error)) {
                    var len = error.length;
                    for (var i = 0; i < len; i++) {
                        response.addErrorCode(error[i].code, error[i].msg);
                    }
                }
                else {
                    response.addErrorCode(error.code, error.msg);
                }
            }
            else {
                response = new soajsRes(true, data);
            }

            return response;
        };
        if (configuration.controllerResponse) {
            req.soajs.controllerResponse = function (jsonObject) {
                
	            if(jsonObject.error && jsonObject.status && process.env.SOAJS_ERROR2HTTP){
		            res.writeHead(jsonObject.status);
		            res.end(jsonObject.msg);
	            }
	            else{
                    let jsonObj = {};
                    if (req.soajs.buildResponse && jsonObject.code && jsonObject.msg)
                        jsonObj = req.soajs.buildResponse(jsonObject);
    
                    if(jsonObj && jsonObject.status){
                        jsonObj.status = jsonObject.status;
                    }
                
                    var headObj = jsonObj.headObj || {};
                    headObj['Content-Type'] = 'application/json';
                    if (jsonObj.status)
                        res.writeHead(jsonObj.status, headObj);
                    else
                        res.writeHead(200, headObj);
    
                    res.end(JSON.stringify(jsonObj));
                }
            };
        }
        next();
    };
};

