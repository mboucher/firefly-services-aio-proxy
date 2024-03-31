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

const axios = require('axios');
const { Core, State } = require('@adobe/aio-sdk');
const { Services } = require('../utils/constants');

const logger = Core.Logger('utils/ims', {level: 'debug'});

/**
 * Helper function to retrieve existing access token from state db if exists.
 * @param {string} serviceName: This is the key that will be used in the AIO State db.
 * @returns IMS access token
 */
async function getTokenFromState (serviceName) {
    logger.debug(`Retrieving token for ${serviceName} from state db.`);
    if(!serviceName) {
        throw new Error(`Error retreiving token from state db: Service name not provided.`);
    }

    try {
        const state = await State.init();
        const token = await state.get(serviceName); // returns {value, expiration }
        return token;
    } catch (err) {
        logger.error(err);
        throw new Error(`Error retreiving token from state db: ${err}`);
    }
}

/**
 * Helper function to store an access token into state.
 * @param {string} serviceName: This is the key that will be used in the AIO State db.
 * @param {string} IMS Access Token
 * @returns void
 */
async function storeTokenInState (serviceName, token) {
    logger.debug(`Storing token for ${serviceName} in state db.`);
    if(!serviceName) {
        throw new Error(`Error storing token into state db: Service name not provided.`);
    }

    try {
        const state = await State.init();
        await state.put("apo-service-token", token, { ttl: 85400});
        logger.debug(`Access token persisted in state db.`);
        return;
    } catch (err) {
        logger.error(err);
        throw new Error(`Error storing token into state db: ${err}`);
    }
}

/**
 * 
 * @param {Object} params: Must include IMS endpoint, clientId, clientScope, clientSecret
 * @param {string} serviceName: one of: firefly or pie
 * @returns A valide IMS access token
 */
async function getIMSAccessToken(params, serviceName) {
   
    try {
        //const stateResponse = await getTokenFromState(serviceName);
        //if(stateResponse !== undefined) {
        //    return stateResponse;
        //}

        // Token is not available in state. 
        // Let's generate a new one.
        let accessToken;

        if(serviceName === Services.Firefly) {
            const {IMS_ENDPOINT_PROD, FIREFLY_CLIENT_ID, FIREFLY_CLIENT_SCOPE, FIREFLY_CLIENT_SECRET } = params;
            const url = `https://${IMS_ENDPOINT_PROD}?` +
                            `grant_type=client_credentials&` +
                            `client_id=${FIREFLY_CLIENT_ID}&` +
                            `client_secret=${FIREFLY_CLIENT_SECRET}&` +
                            `scope=${FIREFLY_CLIENT_SCOPE}`; 
            
            const res = await axios.post(url);
            accessToken = res.data.access_token;
        }

        if(serviceName === Services.Pie) {
            const {IMS_ENDPOINT_PROD, PIE_CLIENT_ID, PIE_CLIENT_SECRET, PIE_CLIENT_SCOPE } = params;
            const url = `https://${IMS_ENDPOINT_PROD}?` +
                            `grant_type=client_credentials&` +
                            `client_id=${PIE_CLIENT_ID}&` +
                            `client_secret=${PIE_CLIENT_SECRET}&` +
                            `scope=${PIE_CLIENT_SCOPE}`; 
            
            const res = await axios.post(url);
            accessToken = res.data.access_token;
        }

         // Store the access token for 24 hours to minimize unnecessary calls to IMS
         //await storeTokenInState(serviceName, accessToken);
         return accessToken;

    } catch (err) {
        logger.error(`TOKEN GENERATION ERROR: ${err}`);
        throw new Error(`TOKEN GENERATION ERROR: ${err}`);
    }
}

module.exports = {
    getIMSAccessToken
}