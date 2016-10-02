function encodeMessage(system, unit, state) {
    var sA = 0;
    var sG = 0;

    var sRepeat = 15;
    var sPause = 5600;
    var sTune = 350;
    var sBaud = 25;
    var sSpeed = 16;

    var uSleep = 800000;

    var HEAD = "TXP:" + sA + "," + sG + "," + sRepeat + "," + sPause + "," + sTune + "," + sBaud + ",";

    //var TAIL = ",1,1," + sSpeed + ",;";
    var TAIL = ",3,1," + sSpeed + ",;";
    var TAILAN = ",1,1," + sSpeed + ",;";
    var TAILAUS = ",3,1," + sSpeed + ",;";
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

    if (state) {
        var message = HEAD + bitLow + "," + msgM + msgU + bitHigh + "," + AN + TAILAN;
    } else {
        var message = HEAD + bitLow + "," + msgM + msgU + bitHigh + "," + AN + TAILAUS;
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
    var accessory = this;

    accessory.log = log;
    accessory.log("Initializing Brematic accessory ...");

    // Fetch Configuration
    accessory.name = config.name;
    accessory.host = config.host;
    accessory.port = config.port;
    accessory.device = config.device;
    accessory.systemCode = config.systemCode;
    accessory.unitCode = config.unitCode;

    /**
     * Enable or disable verbose output
     * @type {boolean}
     */
    if (config.hasOwnProperty('enableVerbose') && config.enableVerbose === true) {
        accessory.verbose = true;
    } else {
        accessory.verbose = false;
    }


    /**
     * Current state of accessory
     * @type {boolean}
     */
    accessory.currentState = false;
    accessory.setState(accessory.currentState, function () {
    });

    /**
     * Ensures that the last known state is valid
     * @type {boolean}
     */
    accessory.ensureState = true;
}


brematicAccessory.prototype.setState = function (givenState, callback) {
    console.trace('setState');
    var accessory = this;

    var targetState = Boolean(givenState);
    accessory.log('Target state: ' + targetState.toString());

    // Create Message
    var message = encodeMessage(this.systemCode, this.unitCode, targetState);

    var dgram = require('dgram');
    var buffer = new Buffer(message);

    var client = dgram.createSocket('udp4');
    client.send(buffer, 0, buffer.length, accessory.port, accessory.host, function (err, bytes) {
        if (err) throw err;
        client.close();

        if (accessory.verbose) {
            accessory.log('UDP Datagram sent to ' + accessory.host + ':' + accessory.port + ' >> ' + message);
        }

        // Store current state
        accessory.currentState = targetState;

        // Execute callback
        callback(null);
    });
};

brematicAccessory.prototype.getState = function (callback) {
    console.trace('getState');

    var accessory = this;

    accessory.log('Current state is:' + accessory.currentState.toString());
    callback(null, accessory.currentState);

    if (accessory.ensureState) {
        accessory.setState(accessory.currentState, function () {
        });
    }
};

brematicAccessory.prototype.getServices = function () {
    console.trace('getServices');
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
