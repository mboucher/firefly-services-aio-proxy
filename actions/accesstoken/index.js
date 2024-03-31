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
const { Core } = require('@adobe/aio-sdk');
const { getIMSAccessToken } = require('../utils/ims');
const { Services } = require('../utils/constants');
const { errorResponse, passthuResponse, validateRequest} = require('../utils/http');

/**
 * Returns an access token use to invoke Firefly Services API.
 * @param {string} serviceName: identify which Firefly Service you need the token for. Possible values: firefly, pie
 * @returns {Object} JSON response with key access_token which contains the service token
**/
async function main(params) {
    const validationResult = validateRequest(params, 'get');
    if(validationResult.statusCode !== 200) {
        return validationResult;
    }
    const logger = Core.Logger('main', {level: params.LOG_LEVEL});
   
    try {
        let token = null;
        let message = '';
        switch(params.serviceName) {
            case 'firefly':
                token = await getIMSAccessToken(params, Services.Firefly);
                break;
            case 'photoshop':
                token = await getIMSAccessToken(params, Services.Pie);
                break;
            default:
                message = 'Unable to retrieve a token, no service name was provided.'
        }

        if(token === null) {
            return passthuResponse(500,{
                message: message
            })
        } else {
            return passthuResponse(200,{
                access_token: token
            });
        }
    } catch (error) {
        logger.info(`Error while retreiving the access token: ${error}.`);
        return errorResponse(500, `Error while retreiving the access token: ${error}.`);
    }
}

exports.main = main;