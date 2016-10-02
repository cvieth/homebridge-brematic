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
    var gateway = this;

    gateway.log = log;
    gateway.log("Initializing Brematic Gateway ...");

    // Fetch Configuration
    gateway.host = config.host;
    gateway.port = config.port;


    gateway.name = config.name;
    gateway.vendor = config.vendor;
    gateway.device = config.device;
    gateway.systemCode = config.systemCode;
    gateway.unitCode = config.unitCode;


    gateway.address = {};

    //@ToDo: Handle all that driver specific addressing stuff
    var BrematicDriver = gateway.detectDriver(config.vendor, config.device);
    gateway.driver = new BrematicDriver(gateway.log, gateway.address);


    /**
     * Enable or disable verbose output
     * @type {boolean}
     */
    if (config.hasOwnProperty('enableVerbose') && config.enableVerbose === true) {
        gateway.verbose = true;
    } else {
        gateway.verbose = false;
    }


    /**
     * Current state of accessory
     * @type {boolean}
     */
    gateway.currentState = false;
    gateway.setState(gateway.currentState, function () {
    });

    /**
     * Ensures that the last known state is valid
     * @type {boolean}
     */
    gateway.ensureState = true;
};

/**
 * Detect driver required for device
 * @param vendor
 * @param device
 */
Brematic.prototype.detectDriver = function (vendor, device) {
    return require("./lib/generic-driver.js");
};

Brematic.prototype.setState = function (givenState, callback) {
    var accessory = this;

    var targetState = Boolean(givenState);
    accessory.log('Target state: ' + targetState.toString());

    // Create Message
    var message = accessory.driver.encodeMessage(this.systemCode, this.unitCode, targetState);


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