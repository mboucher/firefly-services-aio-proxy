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
const { getIMSAccessToken } = require('../utils/ims');
const { Services } = require('../utils/constants');
const axios = require('axios');
const { errorResponse, passthuResponse, validateRequest } = require('../utils/http');

/**
 * Passthru action to invoke the Firefly API.
 * @param {Object} body payload must follow the Firefly schema: https://developer.adobe.com/firefly-beta/api
 * @returns {Object} JSON response from Firefly as documented.
 */
async function main(params) {
    const validationResult = validateRequest(params, 'post');
    if(validationResult.statusCode !== 200) {
        return validationResult;
    }

    const { 
        PROXY_API_KEY,
        IMS_ENDPOINT_PROD,
        FIREFLY_API_ENDPOINT,
        FIREFLY_CLIENT_ID, 
        FIREFLY_CLIENT_SECRET,
        FIREFLY_CLIENT_SCOPE,
        LOG_LEVEL,
        __ow_method,
        __ow_headers,
        __ow_path,
         ...payload} = params;

    const logger = Core.Logger('main', {level: LOG_LEVEL});
    let mimetype = 'image/png'; // default

    const imsArgs = {
        IMS_ENDPOINT_PROD: IMS_ENDPOINT_PROD,
        FIREFLY_CLIENT_ID:FIREFLY_CLIENT_ID,
        FIREFLY_CLIENT_SCOPE: FIREFLY_CLIENT_SCOPE,
        FIREFLY_CLIENT_SECRET: FIREFLY_CLIENT_SECRET
    };

    try {
        const token = await getIMSAccessToken(imsArgs, Services.Firefly);
        const headers = {
            'x-api-key': FIREFLY_CLIENT_ID,
            'x-accept-mimetype': mimetype,
            'Authorization': `Bearer ${token}`
        };
        const res =  await axios.post(`${FIREFLY_API_ENDPOINT}${__ow_path}`,payload,{ headers:headers });
        return passthuResponse(res.status, res.data);
    } catch (error) {
        logger.info(`Error while calling Firefly API: ${error}.`);
        return errorResponse(500, `Error while calling Firefly API: ${error}.`);
    }
}

exports.main = main;