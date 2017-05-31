/**
 * package driver implements a variety of communicate drivers, eg serial, bluetooth ...
 */
var MakeBlockHD = require('./makeblock_hd');
var CordovaBle = require('./cordova');
var Mtester = require('./mtester');
var Mock = require('./mock');
var Serial = function(){};
if(typeof window == 'undefined') {
  // Serial = require('./serial');
}

/**
 * [create the the driver factory method]
 * @param  {[string]} type [the driver type, 'serial', 'bluetooth', 'mock'] ('mock is only used for test')
 * @return {[driver object]}      [the driver object]
 */
function create(type) {
  'use strict';

  var driver = null;

  switch (type) {
    case 'mtester':
      driver = new Mtester();
      break;
    case 'serial':
      driver = new Serial();
      break;
    case 'makeblockhd':
      driver = new MakeBlockHD();
      break;
    case 'cordova':
      driver = new CordovaBle();
      break;
    case 'mock':
      driver = new Mock();
      break;
    default:
      console.warn('unsupported driver: ', type);
      break;
  }
  if (driver._init) {
    driver._init();
  }

  return driver;
}

exports.create = create;
