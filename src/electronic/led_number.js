const {
  defineNumber,
  defineString
} = require('../core/type');
const Electronic = require('./electronic');
const LedMatrixBase = require('./base/LedMatrixBase');
const { setLedMatrixEmotion } = require('../protocol/cmd');

class LedNumber extends LedMatrixBase {
  /**
   * @constructor
   */
  constructor(port) {
    super(port);
    this.args = {
      number: null
    };
  }

  showNumber(number){
    this.args.number = number;
    this._run();
    return this;
  }
 
  _run() {
    // 拿到参数
    // 拿到协议组装器，组装协议
    let buf = composer(setLedMatrixEmotion, [this.serialPort[0], this.args.number]);
    // 用板子发送协议
    board.send(buf);
  }

  //描述各主控的支持情况:
  //orion 不支持
  static support(){
    return '1110';
  }
}

module.exports = LedNumber;