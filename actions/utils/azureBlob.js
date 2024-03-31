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

const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

/**
 * Generate a presignedURL for Azure blos storage service used by this project. 
 * All parameters MUST be specified in the .env file.
 * @param {string} accountName: Azure sorage account name
 * @param {string} accountKey: Azure storage account key
 * @param {string} containerName: Azure storage containter name
 * @param {string} blobName: The name of the object to access
 * @param {string} permissions: The permissions requested on the object. one of (r, w, rw)
 * @param {integer} expiryInMinutes: number of minutes the url should be valid for.
 * @returns A presi
 */
async function getPresignedURL(accountName, accountKey, containerName, blobName, permissions='rw', expiryInMinutes=60) {
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(blobName);

    // Set the permissions and expiry time for the SAS token
    const sasOptions = {
        containerName: containerName,
        blobName: blobName,
        permissions: permissions,
        startsOn: new Date(),
        expiresOn: new Date(new Date().getTime() + expiryInMinutes * 60 * 1000) // Expiry time in minutes
    };

    const sasToken = await blobClient.generateSasUrl(sasOptions);
    return sasToken;
}


module.exports = {
    getPresignedURL
}