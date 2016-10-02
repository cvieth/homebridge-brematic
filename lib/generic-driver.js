/**
 * Created by cvieth on 02.10.16.
 */

var GenericDriver = function (log, address) {
    var device = this;

    device.log = log;
    device.log("Generic Driver loaded ...");

    device.address = address;
};

GenericDriver.prototype.encodeMessage = function (system, unit, state) {
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

module.exports = GenericDriver;
