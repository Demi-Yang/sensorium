const Board = require('../core/Board');
const electronics = require('../electronic/index');
const Settings = require('./settings');
//支持位置
const SUPPORT_INDEX = Settings.SUPPORTLIST.indexOf('Auriga');

//实现一个板子就注册一个板子名称
class Auriga extends Board{
  constructor(conf){
    //继承 Board
    super(conf);
    let this_ = this;
    // 置空已连接块
    this.connecting = {};
    // 挂载电子模块
    for (let name in electronics) {
      let eModule = electronics[name];
      if(eModule.supportStamp().charAt(SUPPORT_INDEX) === '1'){
        // when use mcore.rgbLed(port, slot)
        this[name] = function(){
          return this_.eModuleFactory(eModule, arguments);
        };
      }
    }
  }
}

// clone method and attributes from board to Auriga.
module.exports = Auriga;