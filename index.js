var Accessory, Service, Characteristic, UUIDGen;

module.exports = function (homebridge) {
    console.log("homebridge API version: " + homebridge.version);

    // Accessory must be created from PlatformAccessory Constructor
    Accessory = homebridge.platformAccessory;

    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    // For platform plugin to be considered as dynamic platform plugin,
    // registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
    homebridge.registerPlatform("homebridge-brematic", "Brematic", brematicPlatform, true);

};


function brematicPlatform(log, config, api) {
    log("brematicPlatform Init");
    var platform = this;
    this.log = log;
    this.config = config;
    //this.accessories = [];

    if (api) {
        // Save the API object as plugin needs to register new accessory via this object.
        this.api = api;

        // Listen to event "didFinishLaunching", this means homebridge already finished loading cached accessories
        // Platform Plugin should only register new accessory that doesn't exist in homebridge after this event.
        // Or start discover new accessories
        this.api.on('didFinishLaunching', function () {
            platform.log("DidFinishLaunching");
        }.bind(this));
    }

    var devices = config['devices'];

    this.log(devices);
}

brematicPlatform.prototype.configureAccessory = function (accessory) {
    this.log("-> configureAccessory");
};
brematicPlatform.prototype.configurationRequestHandler = function (context, request, callback) {
    this.log("-> configurationRequestHandler");
};
brematicPlatform.prototype.addAccessory = function (accessoryName) {
    this.log("-> addAccessory");
};
brematicPlatform.prototype.updateAccessoriesReachability = function () {
    this.log("-> updateAccessoriesReachability");
};
brematicPlatform.prototype.removeAccessory = function () {
    this.log("-> removeAccessory");
};