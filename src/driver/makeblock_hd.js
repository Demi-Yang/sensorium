/**
 * driver for makeblockHD APP( js bridge)
 */

var Driver = require('./driver');
var Parse = require('../core/parse');
var driver = new Driver();

var parse = new Parse();

/**
 * [buffer2string converts array buffer to string format]
 * @param  {ArrayBuffer} buf [the input array buffer]
 * @return {String}     [the output string]
 */
function buffer2string(buf) {
  var buffer = new Uint8Array(buf);
  return Array.prototype.join.call(buffer, " ");
}

/**
 * [string2buffer converts string to array buffer format]
 * @param  {String} str [the input string]
 * @return {Uint8Array}     [the output uint8 array buffer]
 */
function string2buffer(str) {
  var buffer = new Uint8Array(str.split(" "));
  return buffer;
}

function MakeblockHD() {
  'use strict';

  var self = this;

  this._init = function() {
    if (window) {
      window.receiveBluetoothData = function(str) {
        var data = string2buffer(str);
        // parse buffer data
        parse.doParse(data, driver);
      };
    }
  };

  /**
   * [_send sends array buffer to driver]
   * @param  {[ArrayBuffer]} buf [the buffer to send]
   * @return {[integer]}     [the actual byte length sent. -1 if send fails.]
   */
  this._send = function(buf) {

    if(typeof TellNative != "undefined") {
        return TellNative.sendViaBluetooth(buffer2string(buf));
    }
  };


}

MakeblockHD.prototype = driver;

module.exports = MakeblockHD;