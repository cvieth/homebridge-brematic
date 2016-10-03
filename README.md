# homebridge-brematic
[![npm version](https://badge.fury.io/js/homebridge-brematic.svg)](https://badge.fury.io/js/homebridge-brematic)
[![Gitter](https://badges.gitter.im/cvieth/homebridge-brematic.svg)](https://gitter.im/cvieth/homebridge-brematic?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge)
[![Beerpay](https://beerpay.io/cvieth/homebridge-brematic/badge.svg?style=beer)](https://beerpay.io/cvieth/homebridge-brematic)
[![Beerpay](https://beerpay.io/cvieth/homebridge-brematic/make-wish.svg?style=flat)](https://beerpay.io/cvieth/homebridge-brematic)

Homebridge plugin for Brennenstuhl Brematic Gateway and compatible devices like "Conn Air"

## Installation
Follow the instruction in [homebridge](https://www.npmjs.com/package/homebridge) for the
homebridge server installation.

The plugin is published through [NPM](https://www.npmjs.com/package/homebridge-brematic) and
should be installed "globally" by typing:

    npm install -g homebridge-brematic

## Configuration

Brematic Switches will be configured as accessories in your homebridge configuration.

| Name         | Optional | Type        | Description                           |
| ------------ | -------- | ----------- | ------------------------------------- |
|accessory     |no        |`"Brematic"` |Fixed value to use this plugin         |
|name          |no        |`String`     |Name of the Device                     |
|host          |no        |`String`     |Hostname of your gateway               |
|port          |yes       |`int`        |Port of your gateway (Usually 49880)   |
|vendor        |no        |`String`     |Name of vendor (See Supported Devices) |
|device        |no        |`String`     |Name of device (See Supported Devices) |
|address       |no        |`Object`     |Device address depending on driver     |
|enableVerbose |yes       |`bool`       | Set to `true` to enable verbose mode  |

### Example:
```json
{
 "bridge": {
    "name": "Homebridge",
    "username": "CC:22:3D:E3:CE:30",
    "port": 51826,
    "pin": "031-45-154"
  },
  "platforms": [
  ],
  "accessories": [
    {
      "accessory": "Brematic",
      "name": "Example Switch",
      "host": "192.168.0.100",
      "port": 49880,
      "vendor": "Brennenstuhl",
      "device": "RCS1000N",
      "address": {
        "systemCode": "00000",
        "unitCode": "00000" 
      }
    }
  ]
}
```

## Supported Devices

Below you can find a list of devices that are currently supported:

| Vendor       | Device Name | Driver  |
| ------------ | ----------- | ------- |
| Brennenstuhl | RCS1000N    | generic |
| Pollin       | 2605        | generic |



