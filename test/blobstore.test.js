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

jest.mock('@adobe/aio-sdk', () => ({
    Core: {
      Logger: jest.fn()
    }
  }))
  
  const { Core } = require('@adobe/aio-sdk')
  const dotenv = require('dotenv');

  dotenv.config();
  
  const mockLoggerInstance = { info: jest.fn(), debug: jest.fn(), error: jest.fn() }
  Core.Logger.mockReturnValue(mockLoggerInstance)
  
  jest.mock('node-fetch')
  const action = require('../actions/blobstore/index');

  beforeEach(() => {
    Core.Logger.mockClear()
    mockLoggerInstance.info.mockReset()
    mockLoggerInstance.debug.mockReset()
    mockLoggerInstance.error.mockReset()
  })

  const fakeFFParams = {
    PROXY_API_KEY:process.env.PROXY_API_KEY,
    __ow_headers: { 'x-api-key': process.env.PROXY_API_KEY },
    __ow_method:'post',
    STORAGE_ACCOUNT_NAME: process.env.STORAGE_ACCOUNT_NAME,
    STORAGE_ACCOUNT_KEY: process.env.STORAGE_ACCOUNT_KEY,
    STORAGE_CONTAINER_NAME: process.env.STORAGE_CONTAINER_NAME,
    LOG_LEVEL: 'debug'
  };

  describe('blobstore', () => {
    test('main should be defined', () => {
      expect(action.main).toBeInstanceOf(Function)
    })
    test('should set logger to use LOG_LEVEL param', async () => {
      await action.main({ ...fakeFFParams})
      expect(Core.Logger).toHaveBeenCalledWith(expect.any(String), { level: 'debug' })
    })
    test('should return an http error if not a POST request', async () => {
      const response = await action.main({__ow_method:'get', __ow_headers: {}});
      expect(response).toEqual({
        statusCode: 405,
        headers:{
          'Content-Type':'application/json'
        },
        body: { error: expect.any(String) }
      })
    })
    test('should return an error reponse with missing x-api-key', async () => {
      const response = await action.main({__ow_method:'post', __ow_headers: {}})
      expect(response).toEqual({
        statusCode: 401,
        headers: {"Content-Type": "application/json"},
        body: { error: expect.any(String) }
      })
    })
    test('should return an error reponse with missing filename', async () => {
      const response = await action.main(fakeFFParams)
      expect(response).toEqual({
        statusCode: 400,
        headers: {"Content-Type": "application/json"},
        body: { error: expect.any(String) }
      })
    })
    test('should return an error reponse with missing permissions', async () => {
      const response = await action.main({...fakeFFParams, fileName: 'fake.png'})
      expect(response).toEqual({
        statusCode: 400,
        headers: {"Content-Type": "application/json"},
        body: { error: expect.any(String) }
      })
    })
    test('should return an error reponse with incorrect permissions', async () => {
      const response = await action.main({...fakeFFParams, fileName: 'fake.png', permissions: 'x'})
      expect(response).toEqual({
        statusCode: 400,
        headers: {"Content-Type": "application/json"},
        body: { error: expect.any(String) }
      })
    })
    test('should return a valid presignedUrl', async () => {
      const response = await action.main({...fakeFFParams, fileName: 'fake.png', permissions: 'w'})
      expect(response).toEqual({
        statusCode: 200,
        headers: {"Content-Type": "application/json"},
        body: { presignedUrl: expect.any(String) }
      })
    })
    
  })