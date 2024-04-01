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
const  callPhotoshopAPI = require('./photoshopAPIClient');
const Mustache = require('mustache');

/**
 * Bulk operation to get the manifest for every PSD document provided in the request
 * @param {Object} args incoming request from HTTP POST call
 * @param {*} logger 
 * @returns A JSON object with an array of document manifests extracted from the provided PSD documents.
 */
async function getDocumentManifest(args, logger) {
    // Build get document manifest request payload using the first document
    const inputs = [
        {
            "storage":"azure",
            "href": args.documents[0].input.href
        }
    ];
    
    // strip the incoming request body and replace with get manifest request
    delete args.documents;
    const params = {...args, inputs}

    // Set the photoshop API path since it is not provided in the incoming request
    params.__ow_path='/pie/psdService/documentManifest';
    
    try { 
        const result = await callPhotoshopAPI(params);
        return result;
    } catch(err) {
        logger.debug(`GET MANIFEST ERROR: ${err}`);
        throw err;
    }
}

/**
 * Generate a generic edit document JSON that only contains layers with Mustache placehol
 * @param {Object} manifest of the provided PSD document
 * @returns edit document JSON 
 */
function buildDocumentEditJSON ( manifest, logger ) {
    const layers = manifest.body.outputs[0].layers;
    const mustacheRE = new RegExp(/\{\{[^{}]+\}\}/);
    const edits = [];
    try {
        layers.forEach(layer => {
            layer.children.map(child => {
                if(child.type === 'textLayer') {
                    const content = child.text.content;
                    if(mustacheRE.test(content)) {
                        const edit = {
                            "edit":{},
                            "id": child.id,
                            "text": {
                                "content": content
                            }
                        };
                        edits.push(edit);
                    }
                }
            });
        });
        return edits;
    } catch (err) {
        logger.debug(`EDIT PSD ERROR: ${err}`);
        throw err;
    }
}

/**
 * Loops through each document provided in the request and uses Mustache.render to subtitute placeholders with 
 * values of matching keys in the request body.
 * @param {Object} args incoming request from HTTP POST call 
 * @param {Object} edits generic edit document JSON generated from the manifest
 * @param {*} logger 
 * @returns an array of responses from the Photoshop API after editing the documents.
 */
async function processDocuments(args, documents, edits, logger) {
    try {
        const results = Promise.all(documents.map(async (document) => {
            const updatedContent = Mustache.render(JSON.stringify(edits),document.data);
            const updatedContentJson = await JSON.parse(updatedContent);
            // Dynamically build the request payload.
            const payload = {
                inputs: [
                    {
                        storage: "azure",
                        href: document.input.href,
                    }
                ],
                options: {
                    layers: updatedContentJson
                },
                outputs: [
                    {
                        storage:"azure",
                        href: document.output.href,
                        type: 'image/vnd.adobe.photoshop'
                    }
                ]
            };

            // strip the incoming request body and replace with apply psd edits request
            delete args.documents;
            args.__ow_path = '/pie/psdService/documentOperations';
            const params = {...args, ...payload};
            return callPhotoshopAPI(params);
        }));

        return results;
    } catch (err) {
        logger.debug(`EDIT DOCUMENT ERROR: ${err.message}`);
        throw new Error(`EDIT DOCUMENT ERROR: ${err.message}`);
    }
    
}


/**
 * Processes one or more PSD documents to find Mustache markup in text layers and substitute with the value
 * of matching keys provided in the "data" object associated with each document.
 * NOTE: For performance reasons, it is assumed that all PSD documents in the request have identical structures.
 * @param {Object} args incoming request from HTTP POST call
 * @param {*} logger 
 * @returns A JSON response with a status and array of processed results.
 */
async function replaceTextInLayers(args, logger) {
    try {
        const documents = args.documents;
        // Step 1: Retrieve manifest from first document    
        const manifest = await getDocumentManifest(args, logger);
        // Step 2: Locate textLayers with Mustache placeholders in the manifest and build generic editDocument JSON.
        const edits = buildDocumentEditJSON(manifest, logger);
        // Step 3: Apply document specific edits provided in the request 
        const results = await processDocuments(args, documents, edits, logger);

        return results.body;
    } catch (err) {
        logger.debug(`DOCUMENT PROCESSING ERROR: ${err.message}`)
        throw err;
    }
}

module.exports = {
    replaceTextInLayers
}