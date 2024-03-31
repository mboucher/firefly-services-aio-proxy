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

/**
 * Implements a delay function used for Photoshop APIs which are async.
 * @param {int} Number of milliseconds to wait (Default: 1000)
 */
const DEF_DELAY = 1000;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
}

/**
 * A convinience function which will poll the Photohop endpoint until a success or failure is returned.
 * This implementation alters the Photoshop API call to be synchronous for the caller. 
 * @param {Object} jobResponse: The JSON response returned from the Photoshop API call.
 * @param {Object} headers: HTTP headers to use while making the request (specifically Authorization header)
 * @returns The completed job results as a JSON object. See: https://developer.adobe.com/firefly-services/docs/photoshop/api/photoshop_status/
 */
async function monitorJob (jobResponse, headers) {
    let working = true;
        let res = null;
        while (working) {
            res = await axios.get(jobResponse['_links'].self.href,{headers: headers});
            if(res.data.status) {
              // Single job
              if(res.data.status === 'succeeded' || res.data.status === 'failed') {
                return res;
              }
            } else if(res.data.outputs[0].status === 'succeeded' || res.data.outputs[0].status === 'failed') {
              // Batch job
                return res;
            } else {
              await delay(1000);
            }
        }
}

module.exports = {
    monitorJob
};