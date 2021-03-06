import { validateNumber } from '../core/validate';
import {composer,
fiterWithBinaryStr} from '../core/utils';
import Electronic from './electronic';
import protocolAssembler from '../protocol/cmd';
import Control from '../core/control';
import { SUPPORTLIST } from '../settings';

/**
 * GPIOContinue sensor module
 * @extends Electronic
 */
class GPIOContinue extends Electronic {
  constructor(port, key) {
    super();
    this.args = {
      port: validateNumber(port, 1),
      key: validateNumber(key, 1)
    };
  }

  /**
   * getter of protocol
   */
  get protocol() {
    return composer(protocolAssembler.readGPIOContinue, [this.args.port, this.args.key]);
  }

  /**
   * Get data of GPIOContinue sensor
   * @return {Promise}
   */
  async getData() {
    return await Control.read(this.protocol);
  }

  static get SUPPORT(){
    return fiterWithBinaryStr(SUPPORTLIST, '00001');
  }
}

export default GPIOContinue;