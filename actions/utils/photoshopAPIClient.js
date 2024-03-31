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
const { getIMSAccessToken } = require('./ims');
const { Services } = require('./constants');
const axios = require('axios');
const {passthuResponse, errorResponse} = require('./http');
const { monitorJob } = require('./photoshopJob');

async function callPhotoshopAPI (args) {
    const { 
        PROXY_API_KEY,
        IMS_ENDPOINT_PROD,
        PHOTOSHOP_API_ENDPOINT,
        PIE_CLIENT_ID, 
        PIE_CLIENT_SECRET,
        PIE_CLIENT_SCOPE,
        LOG_LEVEL,
        __ow_method,
        __ow_headers,
        __ow_path,
         ...payload} = args;

    const logger = Core.Logger('main', {level: LOG_LEVEL});

    // Only allow POST.
    if(__ow_method !== 'post') {
    logger.debug(`Request not allowed: ${__ow_method} `);
    return errorResponse(405, `Method not allowed.`);
    }

    // Validate API key.
    if(!__ow_headers['x-api-key']) {
        logger.error(`API Key not provided.`);
        return errorResponse(405, `API key not provided.`);
    }
    if(__ow_headers['x-api-key'] !== PROXY_API_KEY) {
        logger.error(`Invalid API key.`);
        return errorResponse(405, `Invalid API key.`);
    } 


    try {
        const imsArgs = {
            IMS_ENDPOINT_PROD: IMS_ENDPOINT_PROD,
            PIE_CLIENT_ID:PIE_CLIENT_ID,
            PIE_CLIENT_SCOPE: PIE_CLIENT_SCOPE,
            PIE_CLIENT_SECRET: PIE_CLIENT_SECRET
        };

        const token = await getIMSAccessToken(imsArgs, Services.Pie);
        const headers = {
            'x-api-key': PIE_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const job =  await axios.post(`${PHOTOSHOP_API_ENDPOINT}${__ow_path}`,payload,{ headers:headers });
        if(job.status === 202) {
            const result = await monitorJob(job.data, headers);
            return passthuResponse(result.status, result.data);
        } else {
            return passthuResponse(job.statusCode, job.data);
        }

    } catch (error) {
        logger.info(`Error while calling Photoshop API: ${error}.`);
        return errorResponse(500, `Error while calling Photoshop API: ${error}.`);
    }
}

module.exports = callPhotoshopAPI;