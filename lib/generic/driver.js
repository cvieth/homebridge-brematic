/**
 * Created by cvieth on 02.10.16.
 */

var GenericDriver = function (log) {
    var driver = this;

    driver.log = log;
    driver.log("Generic Driver loaded ...");

    driver.address = null;

    // Driver specific configuration
    driver.bitLow = 1;
    driver.bitHigh = 3;

    driver.seqLow = driver.bitHigh + "," + driver.bitHigh + "," + driver.bitLow + "," + driver.bitLow + ",";
    driver.seqHgh = driver.bitHigh + "," + driver.bitLow + "," + driver.bitHigh + "," + driver.bitLow + ",";
};

/**
 * Validate & set address
 * @param {Object} address
 */
GenericDriver.prototype.setAddress = function (address) {
    var driver = this;

    driver.log("Setting address configuration ...");

    // Validate address
    if ((address.hasOwnProperty('systemCode')) && address.hasOwnProperty('unitCode')) {
        if ((address.systemCode.length == 5) && (address.unitCode.length == 5)) {
            // Store devices address
            driver.address = address;
        } else {
            driver.log("Address is not valid");
            //@ToDo: Adress not valid
        }
    } else {
        driver.log("Address is not set");
        //@ToDo: Adress not set
    }
};

/**
 * Encode Address
 * @private
 * @param {string} address
 * @return {string}
 */
GenericDriver.prototype.encodeAddress = function (address) {
    var driver = this;

    var msg = "";

    for (var i = 0, len = address.length; i < len; i++) {
        var bit = address[i];
        if (bit == "0") {
            msg = msg + driver.seqLow;
        } else {
            msg = msg + driver.seqHgh;
        }
    }

    return msg;
};

/**
 * Encode message depending on target state
 * @public
 * @param {Boolean} targetState
 * @return {string} message
 */
GenericDriver.prototype.encodeMessage = function (targetState) {
    var driver = this;

    var sA = 0;
    var sG = 0;

    var sRepeat = 15;
    var sPause = 5600;
    var sTune = 350;
    var sBaud = 25;
    var sSpeed = 16;

    var HEAD = "TXP:" + sA + "," + sG + "," + sRepeat + "," + sPause + "," + sTune + "," + sBaud + ",";

    //var TAIL = ",1,1," + sSpeed + ",;";
    var TAIL = ",3,1," + sSpeed + ",;";
    var TAILAN = ",1,1," + sSpeed + ",;";
    var TAILAUS = ",3,1," + sSpeed + ",;";
    var AN = "1,3,1,3,3";
    var AUS = "3,1,1,3,1";

    if (targetState) {
        return HEAD + driver.bitLow + "," + driver.encodeAddress(driver.address.codeSystem) + driver.encodeAddress(driver.address.codeUnit) + driver.bitHigh + "," + AN + TAILAN;
    } else {
        return HEAD + driver.bitLow + "," + driver.encodeAddress(driver.address.codeSystem) + driver.encodeAddress(driver.address.codeUnit) + driver.bitHigh + "," + AN + TAILAUS;
    }
};

module.exports = GenericDriver;
