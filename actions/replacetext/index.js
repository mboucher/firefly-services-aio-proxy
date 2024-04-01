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

/* eslint-disable no-unused-vars */
const { Core } = require('@adobe/aio-sdk');
const { replaceTextInLayers } = require('../utils/psdDocument');
const { errorResponse, passthuResponse, validateRequest } = require('../utils/http');

async function main(params) {
    const validationResult = validateRequest(params, 'post');
    if(validationResult.statusCode !== 200) {
        return validationResult;
    }

    
    
    const logger = Core.Logger('main', {level: params.LOG_LEVEL});

    // TODO: Should we add an upper limit of PSD documents?
    // Make sure there is at least one document to process.
    if (params['documents'] === undefined || !Array.isArray(params.documents)) {
        logger.debug('Request payload is malformed.');
        return errorResponse(400, 'Invalid request: malformed request payload.');
    }
 
    try {
        const result = await replaceTextInLayers(params, logger);
        return passthuResponse(200, {results: result});
    } catch(err) {
        return errorResponse(400, {message: err})
    }
}

exports.main = main;