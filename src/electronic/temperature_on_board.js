import { defineNumber } from '../core/type';
import Utils from '../core/utils';
import Electronic from './electronic';
import protocolAssembler from '../protocol/cmd';
import Command from '../communicate/command';

class TemperatureOnBoard extends Electronic {
  constructor() {
    super();
  }

  getData(callback) {
    // 拿到协议组装器，组装协议
    let buf = Utils.composer(protocolAssembler.readTemperatureOnBoard);
    //执行
    Command.execRead(buf, callback);
    return this;
  }

  //主控支持戳：描述各主控的支持情况
  //只有 auriga 支持 
  static supportStamp(){
    return '0100';
  }

}

export default TemperatureOnBoard;