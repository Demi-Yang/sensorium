import { validateNumber } from '../core/validate';
import {composer,
fiterWithBinaryStr} from '../core/utils';
import Electronic from './electronic';
import protocolAssembler from '../protocol/cmd';
import Control from '../core/control';
import { SUPPORTLIST } from '../settings';

/**
 * DigGPIO sensor module
 * @extends Electronic
 */
class DigGPIO extends Electronic {
  constructor(port) {
    super();
    this.args = {
      port: validateNumber(port)
    };
  }

  /**
   * getter of protocol
   */
  get protocol() {
    return composer(protocolAssembler.readDigGPIO, [this.args.port]);
  }

  /**
   * Get data of DigGPIO sensor
   * @return {Promise}
   */
  async getData() {
    return await Control.read(this.protocol);
  }

  static get SUPPORT(){
    return fiterWithBinaryStr(SUPPORTLIST, '00001');
  }
}

export default DigGPIO;