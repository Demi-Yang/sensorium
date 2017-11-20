/**
 * @fileOverview Sensorium Class
 * @version 0.2.2
 * @author Jeremy
 */
import Transport from './communicate/transport';
import Control from './core/control';
import Version from './electronic/version';
import { SUPPORTLIST, FIRMWARE_ID } from './settings';
import BoardsObj from './mainboard/index';

/**
 * Sensorium
 * @description  Sensorium is the only namespace of this repository
 * @namespace
 */
class Sensorium {
  /**
   * Create a sensorium.
   * @example
   * let sensorium = new Sensorium();
   */
  constructor(){
    for(let name of SUPPORTLIST){
      this['create' + name] = (opts) => this.create(name, opts);
    }
  }

  /**
   * Create a mainboard instance
   * @param {String} mainboardName  both upperCase and lowerCase are allow
   * @param {Object} opts     (optional)
   * @example
   * // create a mcore with mainboardName, both upperCase and lowerCase are allow
   * let mcore1 = sensorium.create('mcore');
   * let mcore2 = sensorium.create('mCore');
   * mcore1 === mcore2
   */
  create(mainboardName, opts){
    let board = BoardsObj[mainboardName.toLowerCase()];
    if(typeof board == 'undefined'){
      throw new Error(`sorry, the board ${mainboardName} could not be supported!
        You need pass in one of ${this.getSupported().join(',')} as the first argument}`);
    }
    return new board(opts);
  }

  /**
   * set transport such as bluetooth、serialport、wifi
   * @param {Function} sender send method
   * @param {Function} transport.onReceived onReceived method
   * @example
   * let sender = () => {...}
   * sensorium.setSender(sender);
   */
  setSender(sender){
    Transport.sender = sender;
  }

  /**
   * 数据分发，目前只支持分发到 pipe
   * @param  {Buffer} buff
   */
  doRecevied (buff) {
    Control.pipe(buff);
  }

  /**
   * read firmware verion and parse the device info
   * @return {Promise} a promise instance
   * @example
   * sensorium.readFirmwareInfo()
   *             .then((val) => {console.log(val)});
   */
  async readFirmwareInfo(){
    return await Version.getData().then((val) =>{
      let id, name;
      if(val){
        id = val.split('.')[0];
        name = FIRMWARE_ID[parseInt(id)];
      }
      return {name, val};
    });
  }

  /**
   * write protocol buffer
   * now this interface is just for debug the protocol
   * @param  {Array} buf
   * @example
   * sensorium.send([0xff, 0x55, 0x01...]);
   */
  send (buf){
    Control.write(buf);
  }

  /**
   * read protocol buffer
   * now this interface is just for debug the protocol
   * @param  {Array} buf
   * @example
   * sensorium.send([0xff, 0x55, 0x01...]);
   */
  async read (buf){
    return await Control.read(buf);
  }

  /**
   * Get supported mainboard
   * @example
   * sensorium.SUPPORT
   * // => ['auriga', 'mcore', 'megapi', 'orion', 'megapipro', 'arduino']
   * @return {Array}  a support list
   */
  get SUPPORT() {
    return Object.keys(BoardsObj);
  }
}

//webpack umd
module.exports = Sensorium;