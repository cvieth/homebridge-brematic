# homebridge-brematic
[![npm version](https://badge.fury.io/js/homebridge-brematic.svg)](https://badge.fury.io/js/homebridge-brematic)
[![Gitter](https://badges.gitter.im/cvieth/homebridge-brematic.svg)](https://gitter.im/cvieth/homebridge-brematic?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge)
[![Beerpay](https://beerpay.io/cvieth/homebridge-brematic/badge.svg?style=beer)](https://beerpay.io/cvieth/homebridge-brematic)
[![Beerpay](https://beerpay.io/cvieth/homebridge-brematic/make-wish.svg?style=flat)](https://beerpay.io/cvieth/homebridge-brematic)

Homebridge plugin for Brennenstuhl Brematic Gateway and compatible devices like "Conn Air"

# Installation
Follow the instruction in [homebridge](https://www.npmjs.com/package/homebridge) for the
homebridge server installation.

The plugin is published through [NPM](https://www.npmjs.com/package/homebridge-brematic) and
should be installed "globally" by typing:

    npm install -g homebridge-brematic

# Configuration

Brematic Switches will be configured as accessories in your homebridge configuration.

| Name | Mandetory | Default | Description |
| --- | --- | --- | --- |
|accessory |yes | - |Must be set to "Brematic" |
|name |yes | - |Name of the Device |
|host |yes | - |Hostname of your gateway |
|port |yes | - |Port of your gateway, usually 49880 |
|device |yes | - |Name of device (See Supported Devices) |
|systemCode |yes | - |System Code Address (5 Bit) |
|unitCode |yes | - |Unit Code Address (5 Bit) |
|enableVerbose |no | `false` | Set to `true` to enable verbose mode |

## Example:
```json
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
      "device": "Brennenstuhl RCS1000N",
      "systemCode": "00000",
      "unitCode": "00000" 
    }
  ]
```

# Supported Devices

Below you can find a list of devices that are currently supported:

  * Brennenstuhl RCS1000N
  * Pollin 2605

