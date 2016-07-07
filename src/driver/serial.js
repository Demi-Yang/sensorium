/**
 * [Serial Driver implementation. ONLY works in NodeJS]
 */

var Driver = require('./driver');
var SerialPort = require("serialport").SerialPort;
var logger = require('../log/log4js').logger;
var BAUDRATE = 115200;
var driver = new Driver();
var serialName = '';
var serialPort = null;

function checkConnection(err) {
  logger.debug(err.message);
  if (err && (err.message.indexOf('not open') > 0)) {
    logger.warn('serial connection lost.');
    serialName = '';
    serialPort = null;
    initSerial();
  }
}

function initSerial() {
  if (serialName === '') {
    // find serial available serial port
    require("serialport").list(function(err, ports) {
      var hostname=os.hostname();
      if(hostname == 'makeblock_linkit'){
        //for linkit7688 by makeblock
        serialName = '/dev/ttyS1';
      }else{
        //for PC and raspberry pi
        ports.forEach(function(port) {
          var name = port.comName;
          var NAME = name.toUpperCase();
          if (NAME.indexOf('USB') > 0 || NAME.indexOf('AMA') > 0) {
            logger.debug('serial port found:', name);
            serialName = name;
            return;
          }
        });
      }

      if (serialPort === null && serialName !== '') {

        serialPort = new SerialPort(serialName, {
          baudrate: BAUDRATE
        });

        serialPort.on('open', function() {
          logger.info('serial opened: ', serialName);

          serialPort.on('data', function(data) {
            logger.debug('serial data received: ' + data.length);
            // parse buffer data

          });

          serialPort.on('error', function(err) {
            logger.warn('serial port error ' + err);
            if (driver._on_error) {
              driver._on_error(err);
            }
            checkConnection(err);
          });
        });
      }
    });
  }
}

function Serial() {
  'use strict';

  var self = this;
  this._init = function() {
    initSerial();
  };

  /**
   * [_send sends array buffer to driver]
   * @param  {[ArrayBuffer]} buf [the buffer to send]
   * @return {[integer]}     [the actual byte length sent. -1 if send fails.]
   */
   this._send = function(buf) {
    if (serialPort === null) {
      initSerial();
      return -1;
    }

    logger.debug('try sending buffer: ', utils.hexBuf(buf));

    var tempBuf = new Buffer(buf.byteLength + 3);

    serialPort.write(tempBuf, function(err, results) {
      if (err) {
        logger.warn(err);
        checkConnection(err);
        return -1;
      }
    });
    return buf.byteLength + 3;
  };
}


Serial.prototype = driver;

module.exports = Serial;