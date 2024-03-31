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
const { getPresignedURL } = require('../utils/azureBlob');
const {passthuResponse, errorResponse, validateRequest} = require('../utils/http');

/**
 * This action returns a SAS URL from Azure blob storage.
 * The storagae container is transient. All files are deleted after 1 day.
 * @param {string} fileName: the name of the file in the blob store
 * @param {enum} permissions: the permissions requested on the file. Allowed values (r, w)
 * @returns {string} presignedURL to a transient blob store
**/
async function main(params) {

    const validationResult = validateRequest(params, 'post');
    if(validationResult.statusCode !== 200) {
        return validationResult;
    }

    const { 
        PROXY_API_KEY,
        STORAGE_ACCOUNT_NAME,
        STORAGE_ACCOUNT_KEY,
        STORAGE_CONTAINER_NAME,
        LOG_LEVEL,
        __ow_method,
        __ow_headers,
        __ow_path,
        ...query} = params;
    console.log(query);
            
    const logger = Core.Logger('main', {level: LOG_LEVEL});

    // Validate request params
    if(!query.fileName) {
        logger.error(`Missing request parameter: fileName`);
        return errorResponse(400, `Missing request parameter: fileName`);
    }

    if(!query.permissions) {
        logger.error(`Missing request parameter: permissions`);
        return errorResponse(400, `Missing request parameter: permissions`);
    } 

    if(query.permissions !== 'w' && query.permissions !== 'r' && query.permissions !== 'rw'){
        logger.error(`Invalid permissions parameter: ${query.permissions}`);
        return errorResponse(400, `Invalid permissions parameter: ${query.permissions}`);
    }

    try {
        const url = await getPresignedURL(STORAGE_ACCOUNT_NAME,STORAGE_ACCOUNT_KEY,STORAGE_CONTAINER_NAME,query.fileName, query.permissions, 60);
        return passthuResponse(200,{
            presignedUrl: url
        });

    } catch (error) {
        logger.error(`ERROR generating presignedUrl: ${error}.`);
        return errorResponse(500, `ERROR generating presignedUrl: ${error}.`);
    }
}

exports.main = main