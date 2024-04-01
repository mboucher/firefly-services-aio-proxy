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
const {passthuResponse} = require('./http');
const { monitorJob } = require('./photoshopJob');

async function callPhotoshopAPI (args) {
    let logger=null;
    try {
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
    
        logger = Core.Logger('main', {level: LOG_LEVEL});

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
        throw error;
    }
}

module.exports = callPhotoshopAPI;