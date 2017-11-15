/**
 * @fileOverview 解析器负责数据解析，对外输出解析方法.
 */
import {
  arrayFromArrayBuffer,
  bytesToString,
  calculateResponseValue
} from "./utils";

// 获取到的最大指令长度
const REC_BUF_MAX_LENGTH = 40;
const BUF_START_FLAG = [0xff, 0x55];
const BUF_END_FLAG = [0x0d, 0x0a];

function checkStart(flag1, flag2) {
  return flag1 === BUF_START_FLAG[0] && flag2 === BUF_START_FLAG[1]
}

function checkEnd(flag1, flag2) {
  return flag1 === BUF_END_FLAG[0] && flag2 === BUF_END_FLAG[1];
}

export default {
  cacheBuffer: [],

  /**
   * 解析从硬件传递过来的数据
   * @param  {Array} buffData buffer that from the response
   * @return {Array}          the parsed result
   * data : 当前处理的数据
   * this.cacheBuffer: 历史缓存数据, 记录数据和历史数据分开记录
   */
  doParse: function(buffData) {
    let recvLength = 0;
    //是否允许接收
    let isAllowRecv = false;
    let tempBuf = [];

    let data = arrayFromArrayBuffer(buffData);
    let newdata = this.cacheBuffer.concat(data);
    this.cacheBuffer = newdata;
    // parse buffer newdata
    for (let i = 0; i < newdata.length; i++) {
      let data1 = parseInt(newdata[i - 1]),
        data2 = parseInt(newdata[i]);
      // start data
      if (checkStart(data1, data2)) {
        recvLength = 0;
        isAllowRecv = true;
        tempBuf = [];
      }
      // end data
      else if (checkEnd(data1, data2)) {
        //没有头部但有尾部 - 说明是无效数据
        if (!isAllowRecv) {
          this.cacheBuffer = [];
          return undefined;
        } else {
          isAllowRecv = false;
        }
        let resultBuf = tempBuf.slice(0, recvLength - 1);
        // 解析正确的数据后，清空 buffer
        this.cacheBuffer = [];
        return resultBuf;
      }
      // the data we really want
      else {
        if (isAllowRecv) {
          if (recvLength >= REC_BUF_MAX_LENGTH) {
            console.warn("receive buffer overflow!");
          }
          tempBuf[recvLength++] = data2;
        }
      }
    }
  },

  /**
   * Get result from buffer data.
   * @param  {Array} buf array data.
   * @return {Float}         value of sensor's callback
   * 回复数据数值解析, 从左到右第四位数据：
   *     1: 单字符(1 byte)
   *     2： float(4 byte)
   *     3： short(2 byte)，16个长度
   *     4： 字符串
   *     5： double(4 byte)
   *     6: long(4 byte)
   *  @example
   *  ff 55 02 02 7c 1a 81 41 0d 0a
   */
  getResult: function(buf) {
    // 获取返回的数据类型
    let dataType = buf[1];
    let result = null;
    switch (dataType) {
      case "1":
      case 1:
        // 1byte
        result = buf[2];
        break;
      case "3":
      case 3:
        // 2byte
        result = calculateResponseValue([parseInt(buf[3]), parseInt(buf[2])]);
        break;
      case "4":
      case 4:
        // 字符串
        var bytes = buf.splice(3, buf[2]);
        result = bytesToString(bytes);
        break;
      case "2":
      case "5":
      case "6":
      case 2:
      case 5:
      case 6:
        // long型或者float型的4byte处理
        result = calculateResponseValue([parseInt(buf[5]), parseInt(buf[4]), parseInt(buf[3]), parseInt(buf[2])]);
        break;
      default:
        break;
    }
    return result;
  }
}