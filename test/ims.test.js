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
  const action = require('../actions/AccessToken/index.js')
  
  beforeEach(() => {
    Core.Logger.mockClear()
    mockLoggerInstance.info.mockReset()
    mockLoggerInstance.debug.mockReset()
    mockLoggerInstance.error.mockReset()
  })
  
  const fakeFFParams = {
    __ow_headers: { 'x-api-key': process.env.PROXY_API_KEY },
    __ow_method:'get',
    PROXY_API_KEY:process.env.PROXY_API_KEY,
    IMS_ENDPOINT_PROD:process.env.IMS_ENDPOINT_PROD,
    FIREFLY_CLIENT_ID: process.env.FIREFLY_CLIENT_ID,
    FIREFLY_CLIENT_SECRET: process.env.FIREFLY_CLIENT_SECRET,
    FIREFLY_CLIENT_SCOPE: process.env.FIREFLY_CLIENT_SCOPE,
    serviceName:'firefly' }

  describe('accesstoken', () => {
    test('main should be defined', () => {
      expect(action.main).toBeInstanceOf(Function)
    })
    test('should return an http error if not a GET request', async () => {
      const response = await action.main({__ow_method:'post'});
      expect(response).toEqual({
        statusCode: 405,
        headers:{
          'Content-Type':'application/json'
        },
        body: { error: expect.any(String) }
      })
    })
    test('should return an error reponse with missing x-api-key', async () => {
      const response = await action.main({__ow_method:'get', __ow_headers:{'Content-Type':'application/json'}})
      expect(response).toEqual({
        statusCode: 401,
        headers: {"Content-Type": "application/json"},
        body: { error: expect.any(String) }
      })
    })
    test('should return an http with a valid access token', async () => {
      const response = await action.main(fakeFFParams)
      expect(response).toEqual({
        statusCode: 200,
        headers: {"Content-Type": "application/json"},
        body: { access_token: expect.any(String) }
      })
    })
  })
    
  