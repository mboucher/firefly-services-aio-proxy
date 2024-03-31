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

const TextToImage = {
    "prompt": "Horses in a field.",
    "negativePrompt": "Flowers, people.",
    "contentClass": "photo",
    "n": 2,
    "seeds": [
      23442,
      783432
    ],
    "size": {
      "width": 2048,
      "height": 2048
    },
    "photoSettings": {
      "aperture": 1.2,
      "shutterSpeed": 0.0005,
      "fieldOfView": 14
    },
    "styles": {
      "presets": [],
      "strength": 60
    },
    "visualIntensity": 6,
    "locale": "en-US"
  };

const RemoveBackground = {
  "input": {
    "href": "",
    "storage": "azure"
  },
  "options": {
    "optimize": "performance",
    "process": {
      "postprocess": true
    },
    "service": {
      "version": "4.0"
    }
  },
  "output": {
    "href": "",
    "storage": "azure",
    "overwrite": true,
    "color": {
      "space": "rgb"
    },
    "mask": {
      "format": "soft"
    }
  }
}
  

  module.exports = {
    TextToImage,
    RemoveBackground
  }