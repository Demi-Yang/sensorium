import { validateNumber } from '../core/validate';
import Utils from '../core/utils';
import Electronic from './electronic';
import protocolAssembler from '../protocol/cmd';
import Control from '../communicate/control';

/**
 * Gas sensor module
 * @extends Electronic
 */
class Gas extends Electronic {
  constructor(port) {
    super();
    this.args = {
      port: validateNumber(port)
    };
  }

  /**
   * 获取协议
   */
  protocol() {
    return Utils.composer(protocolAssembler.readGas, [this.args.port]);
  }

  /**
   * Get data of Gas sensor
   * @return {Promise}
   */
  async getData() {
    return await Control.read(this.protocol());
  }

  static supportStamp(){
    return '1111';
  }
}

export default Gas;