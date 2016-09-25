function encodeMessage(system, unit, state) {
    var sA = 0;
    var sG = 0;

    var sRepeat = 15;
    var sRepeat = 15;
    var sPause = 5600;
    var sTune = 350;
    var sBaud = 25;
    var sSpeed = 16;

    var uSleep = 800000;

    var HEAD = "TXP:" + sA + "," + sG + "," + sRepeat + "," + sPause + "," + sTune + "," + sBaud + ",";

    var TAIL = ",1,1," + sSpeed + ",;";
    //var TAIL = ",3,1," + sSpeed + ",;";
    var AN = "1,3,1,3,3";
    var AUS = "3,1,1,3,1";

    var bitLow = 1;
    var bitHigh = 3;

    var seqLow = bitHigh + "," + bitHigh + "," + bitLow + "," + bitLow + ",";
    var seqHgh = bitHigh + "," + bitLow + "," + bitHigh + "," + bitLow + ",";

    var msg = "";
    var address = system;
    for (var i = 0, len = address.length; i < len; i++) {
        var bit = address[i];
        if (bit == "0") {
            msg = msg + seqLow;
        } else {
            msg = msg + seqHgh;
        }
    }
    var msgM = msg;

    var msg = "";
    var address = unit;
    for (var i = 0, len = address.length; i < len; i++) {
        var bit = address[i];
        if (bit == "0") {
            msg = msg + seqLow;
        } else {
            msg = msg + seqHgh;
        }
    }
    var msgU = msg;

    if (state = "on") {
        var message = HEAD + bitLow + "," + msgM + msgU + bitHigh + "," + AN + TAIL;
    } else {
        var message = HEAD + bitLow + "," + msgM + msgU + bitHigh + "," + AUS + TAIL;
    }
    return message;
}

var Service;
var Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-brematic", "Brematic", brematicAccessory);
};

function brematicAccessory(log, config) {
    this.log = log;

    this.log("Init...");

    this.service = 'Switch';

    // Fetch Configruration
    this.name = config.name;
    this.host = config.host;
    this.port = config.port;
    this.device = config.device;
    this.systemCode = config.systemCode;
    this.unitCode = config.unitCode;
}

/*
 brematicAccessory.prototype.matchesString = function (match) {
 if (this.exactMatch) {
 return (match === this.onValue);
 }
 else {
 return (match.indexOf(this.onValue) > -1);
 }
 }
 */

brematicAccessory.prototype.setState = function (powerOn, callback) {
    var accessory = this;
    var state = powerOn ? 'on' : 'off';
    var prop = state + 'Command';
    var command = accessory[prop];

    accessory.log('Setting ' + accessory.name + ' to ' + state);

    var message = encodeMessage(this.systemCode, this.unitCode, state);
    var dgram = require('dgram');
    var buffer = new Buffer(message);

    var client = dgram.createSocket('udp4');
    client.send(buffer, 0, buffer.length, accessory.port, accessory.host, function (err, bytes) {
        if (err) throw err;
        accessory.log('UDP message sent to ' + accessory.host + ':' + accessory.port + ' >> ' + message);
        callback(null);
        client.close();
    });


    /*
     var stream = ssh(command, accessory.ssh);

     stream.on('error', function (err) {
     accessory.log('Error: ' + err);
     callback(err || new Error('Error setting ' + accessory.name + ' to ' + state));
     });

     stream.on('finish', function () {
     accessory.log('Set ' + accessory.name + ' to ' + state);
     callback(null);
     });
     */
};

brematicAccessory.prototype.getState = function (callback) {
    var accessory = this;

    accessory.log('State of ' + accessory.name + ' fetching');
    callback(null, true);
    /*
     var command = accessory['stateCommand'];

     var stream = ssh(command, accessory.ssh);

     stream.on('error', function (err) {
     accessory.log('Error: ' + err);
     callback(err || new Error('Error getting state of ' + accessory.name));
     });

     stream.on('data', function (data) {
     var state = data.toString('utf-8').trim().toLowerCase();
     accessory.log('State of ' + accessory.name + ' is: ' + state);
     callback(null, accessory.matchesString(state));
     });
     */
};

brematicAccessory.prototype.getServices = function () {
    var accessory = this;

    accessory.log(accessory.name + ' - getServices');


    var informationService = new Service.AccessoryInformation();
    var switchService = new Service.Switch(this.name);

    informationService
        .setCharacteristic(Characteristic.Manufacturer, 'Brennenstuhl')
        .setCharacteristic(Characteristic.Model, this.device)
        .setCharacteristic(Characteristic.SerialNumber, this.systemCode + '-' + this.unitCode);

    var characteristic = switchService.getCharacteristic(Characteristic.On);
    characteristic.on('set', this.setState.bind(this));
    characteristic.on('get', this.getState.bind(this));

    return [switchService];
};
