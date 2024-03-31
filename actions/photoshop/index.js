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

const photoshopAPIClient = require('../utils/photoshopAPIClient');
const { errorResponse, validateRequest } = require('../utils/http');
const { Core } = require('@adobe/aio-sdk');

/**
 * Passthru action to invoke the Photoshop APIs.
 * @param {Object} body payload must follow the Photoshop schema: https://developer.adobe.com/photoshop/photoshop-api-docs/api/#tag/Photoshop/
 * @returns {Object} JSON response from Photoshop API as documented.
**/
async function main(params) {
    const validationResult = validateRequest(params, 'post');
    if(validationResult.statusCode !== 200) {
        return validationResult;
    }

    const logger = Core.Logger('main', {level: params.LOG_LEVEL});

    try {
        const results = await photoshopAPIClient(params);
        return results;

    } catch (error) {
        logger.info(`Error while calling Photoshop API: ${error}.`);
        return errorResponse(500, `Error while calling Photoshop API: ${error}.`);
    }
}

exports.main = main;