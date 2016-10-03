/**
 * Homebridge Brematic Plugin
 *
 * @author Christoph Vieth <christoph@vieth.me>
 */

var Service;
var Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-brematic", "Brematic", Brematic);
};
var Brematic = function (log, config) {
    var device = this;

    device.log = log;
    device.log("Initializing Brematic Gateway ...");

    device.name = config.name;

    // Fetch Configuration
    device.host = config.host;
    device.port = config.port;

    device.vendor = config.vendor;
    device.device = config.device;

    var BrematicDriver = device.detectDriver(config.vendor, config.device);
    device.driver = new BrematicDriver(device.log);

    // Pass address configuration to driver
    if (config.hasOwnProperty('address')) {
        // Set address
        device.driver.setAddress(config.address);
    } else {
        // No address configuration set
        throw Error("No address configuration found!");
    }

    /**
     * Enable or disable verbose output
     * @type {boolean}
     */
    if (config.hasOwnProperty('enableVerbose') && config.enableVerbose === true) {
        device.verbose = true;
    } else {
        device.verbose = false;
    }


    /**
     * Current state of accessory
     * @type {boolean}
     */
    device.currentState = false;
    device.setState(device.currentState, function () {
    });

    /**
     * Ensures that the last known state is valid
     * @type {boolean}
     */
    device.ensureState = true;
};

/**
 * Detect driver required for device
 * @param vendor
 * @param device
 */
Brematic.prototype.detectDriver = function (vendor, device) {
    switch (vendor) {
        default:
            return require("./lib/generic/driver.js");
    }
};

Brematic.prototype.setState = function (givenState, callback) {
    var accessory = this;

    var targetState = Boolean(givenState);
    accessory.log('Target state: ' + targetState.toString());

    // Create Message
    var message = accessory.driver.encodeMessage(targetState);

    // Store current state
    accessory.currentState = targetState;

    // Send Message
    accessory.sendMessage(message, callback);
};

Brematic.prototype.sendMessage = function (message, callback) {
    var accessory = this;

    var dgram = require('dgram');
    var buffer = new Buffer(message);

    var client = dgram.createSocket('udp4');
    client.send(buffer, 0, buffer.length, accessory.port, accessory.host, function (err, bytes) {
        if (err) throw err;
        client.close();

        if (accessory.verbose) {
            accessory.log('UDP Datagram sent to ' + accessory.host + ':' + accessory.port + ' >> ' + message);
        }

        // Execute callback
        callback();
    });
};

Brematic.prototype.getState = function (callback) {

    var accessory = this;

    accessory.log('Current state is:' + accessory.currentState.toString());
    callback(null, accessory.currentState);

    if (accessory.ensureState) {
        accessory.setState(accessory.currentState, function () {
        });
    }
};

Brematic.prototype.getServices = function () {
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