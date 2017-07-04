import { defineNumber } from '../core/type';
import Utils from '../core/utils';
import Electronic from './electronic';
import protocolAssembler from '../protocol/cmd';
import command from '../communicate/command';

class Reset extends Electronic {
  constructor(callback) {
    super();
    this.reset(callback);
  }

  reset(callback) {
    let buf = Utils.composer(protocolAssembler.reset);
    command.execRead(buf, callback);
    return this;
  }

  static supportStamp(){
    return '1111';
  }
}

export default Reset;