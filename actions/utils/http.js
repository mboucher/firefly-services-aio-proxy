/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2024 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 *
 **************************************************************************/

/**
 * Returns a an invalid response object
 * @param {object} The body of the response
 * @returns {object} the response object.
 */
function passthuResponse(code, body) {
    const response = {
        headers: {
            "Content-Type":"application/json"
        },
        statusCode: code,
        body:body
    };

    return response;
}


/**
 * Returns an error response object and attempts to log.debug the status code and error message
 * @param {number} The error code to return
 * @param {string} The error message 
 * @param {*} [logger] OPTIONAL: logger instance
 * @returns {object} the error response object
 */
function errorResponse (statusCode, message, logger) {
    if (logger && typeof logger.info === 'function') {
        logger.debug(`${statusCode}: ${message}`);
      }
      const response = {
        headers: {
            "Content-Type":"application/json"
        },
        statusCode: statusCode,
        body:{error: message}
    };

    return response;
}

/**
 * Convenience function used to validate the request method
 * @param {Object} params - Request object
 * @param {string} expected - the expected method (get, post, put, delete)
 * @returns {Object} HTTP JSON response status 200, 400 or 405
 */
function validateRequest (params, expectedMethod) {
    // Validate method
    if (params['__ow_method'] === undefined) {
        return errorResponse(400, 'Invalid request, missing method.')
    } 
    
    if(params['__ow_method']) {
        if (params['__ow_method'] !== expectedMethod) {
            return errorResponse(405, `Method not allowed.`);
        } 
    }
    
    // Validate API key. 
    if(params['__ow_headers']['x-api-key'] === undefined) {
        return errorResponse(401, `API key not provided.`);
    }

    if(params['__ow_headers']['x-api-key'] !== params.PROXY_API_KEY) {
        return errorResponse(401, `Invalid API key.`);
    } 

    // No body will be included. The calling function only cares about the statusCode.
    return passthuResponse(200,{});
}

module.exports = {
    passthuResponse,
    errorResponse,
    validateRequest
}