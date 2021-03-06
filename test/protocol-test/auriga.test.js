//test latest_auriga：09.01.012
//cmd is also ok
const dataman = require('./dataman');
import * as Utils from "../../src/core/utils";
import protocolAssembler from '../../src/protocol/cmd';
import Auriga from '../../src/mainboard/auriga';
import Control from '../../src/core/control';
import chai from 'chai';
const expect = chai.expect;

function formatProtocol(protocol) {
  let currentCmd = protocol.map(function(val) {
    let newVal = val.toString(16);
    return newVal.length == 1 ? '0' + newVal : newVal;
  });
  return currentCmd.join(' ');
}

let auriga = new Auriga();

describe('【auriga_最新固件 协议测试】', function() {
  describe('#执行协议部分', function() {
    describe('直流电机：auriga.DcMotor(1／2/3/4).speed(-255～255)', function() {
      //生成 5 个测试用例
      let ports = [1, 2, 3, 4, 5];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`设置直流电机端口${i}速度为255`, function() {
          let dcMotor = auriga.DcMotor(port).speed(255);
          let targetCmd = dataman.auriga.write.dcMotor[i];
          let currentCmd = formatProtocol(dcMotor.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      let speeds = [-255, 100, 256, -256];
      for (let i = 0, speed; speed = speeds[i]; i++) {
        it(`设置直流电机端口速度为${speed}`, function() {
          let dcMotor = auriga.DcMotor(1).speed(speed);
          let targetCmd = dataman.auriga.write.dcMotor[i + 5];
          let currentCmd = formatProtocol(dcMotor.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });

    describe('板载编码电机：auriga.EncoderMotorOnBoard(1/2,-255～255)', function() {
      let speeds = [100, 255, -255, 0, 256, -256];
      for (let i = 0; i < speeds.length; i++) {
        let speed = speeds[i];
        it(`板载编码电机slot1 速度 ${speed}`, function() {
          let encoderMotorOnBoard = auriga.EncoderMotorOnBoard(1).speed(speed);
          let targetCmd = dataman.auriga.write.encoderMotorBoard[i];
          let currentCmd = formatProtocol(encoderMotorOnBoard.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
      it('板载编码电机slot2 速度100', function() {
        let encoderMotorOnBoard = auriga.EncoderMotorOnBoard(2).speed(100);
        let targetCmd = dataman.auriga.write.encoderMotorBoard[6];
        let currentCmd = formatProtocol(encoderMotorOnBoard.protocol);
        expect(currentCmd).to.equal(targetCmd);
      });
    });

    describe('外接编码电机：auriga.EncoderMotor(1～4, 1/2, 0～300, 720)', function() {
      let ports = [1, 2, 3, 4];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`外接编码电机port${port} slot1 速度150 角度720`, function() {
          let encoderMotor = auriga.EncoderMotor(port, 1).speed(150).offsetAngle(720);
          let targetCmd = dataman.auriga.write.encoder[i];
          let currentCmd = formatProtocol(encoderMotor.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      it(`外接编码电机port1 slot2 速度150 角度720`, function() {
        let encoderMotor = auriga.EncoderMotor(1, 2).speed(150).offsetAngle(720);
        let targetCmd = dataman.auriga.write.encoder[4];
        let currentCmd = formatProtocol(encoderMotor.protocol);
        expect(currentCmd).to.equal(targetCmd);
      });

      let speeds = [0, 300, 301, -1];
      for (let i = 0; i < speeds.length; i++) {
        let speed = speeds[i];
        it(`外接编码电机port1 slot1 速度${speed} 角度720`, function() {
          let encoderMotor = auriga.EncoderMotor(1, 1).speed(speed).offsetAngle(720);
          let targetCmd = dataman.auriga.write.encoder[i + 5];
          let currentCmd = formatProtocol(encoderMotor.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      let angles = [0, 2147483647, -2147483648, 2147483648, -2147483649];
      for (let i = 0; i < angles.length; i++) {
        let angle = angles[i];
        it(`外接编码电机port1 slot1 速度150 角度${angle}`, function() {
          let encoderMotor = auriga.EncoderMotor(1, 1).speed(150).offsetAngle(angle);
          let targetCmd = dataman.auriga.write.encoder[i + 9];
          let currentCmd = formatProtocol(encoderMotor.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });

    describe('摇杆1：VirtualJoystick(-255～255,-255～255)', function() {
      let leftSpeeds =  [100, 255, -255, 0, -100, 150, 100, 256, -256];
      let rightSpeeds = [100, 255, -255, 150, 100, 0, -100, 256, -256];
      for (let i = 0; i < rightSpeeds.length; i++) {
        let left = leftSpeeds[i];
        let right = rightSpeeds[i];
        it(`app虚拟摇杆1 左轮速度 ${left} 右轮速度 ${right}`, function() {
          let joystick = auriga.VirtualJoystick(1, 1).leftSpeed(left).rightSpeed(right);
          let targetCmd = dataman.auriga.write.joystick[i];
          let currentCmd = formatProtocol(joystick.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });

    describe('摇杆2：VirtualJoystickForBalance(-255~255,-255~255)', function() {
      let turnRanges = [100, 255, -255, 0,   -100, 150, 100,  256, -256];
      let speeds =     [100, 255, -255, 150, 100,  0,   -100, 256, -256];
      for (let i = 0; i < speeds.length; i++) {
        let speed = speeds[i];
        let turnRange = turnRanges[i];
        it(`app虚拟摇杆2 拐弯 ${turnRange} 速度 ${speed}`, function() {
          let joystick = auriga.VirtualJoystickForBalance(1, 1).speed(speed).turnRange(turnRange);
          let targetCmd = dataman.auriga.write.virtualJoystickForBalance[i];
          let currentCmd = formatProtocol(joystick.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });

    describe('步进电机：setStepperMotor(1~4,0~3000,-2147483648~2147483647)', function() {
      let ports = [1, 2, 3, 4];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`步进电机在端口${port} 速度为3000 位移为1000`, function() {
          let stepperMotor = auriga.StepperMotor(port).speed(3000).distance(1000);
          let targetCmd = dataman.auriga.write.stepperMotor[i];
          let currentCmd = formatProtocol(stepperMotor.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      let speeds = [0, 1500, -1, 3001];
      for (let i = 0; i < speeds.length; i++) {
        let speed = speeds[i];
        it(`步进电机在端口1 速度为${speed} 位移为1000`, function() {
          let stepperMotor = auriga.StepperMotor(1).speed(speed).distance(1000);
          let targetCmd = dataman.auriga.write.stepperMotor[i + 4];
          let currentCmd = formatProtocol(stepperMotor.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      let distances = [2147483647, -2147483648, 0, -2147483649, 2147483648];
      for (let i = 0; i < distances.length; i++) {
        let distance = distances[i];
        it(`步进电机在端口1 速度为3000 位移为${distance}`, function() {
          let stepperMotor = auriga.StepperMotor(1).speed(3000).distance(distance);
          let targetCmd = dataman.auriga.write.stepperMotor[i + 8];
          let currentCmd = formatProtocol(stepperMotor.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });

    describe('RGB LED灯条：RgbLed(6~10,1/2,0~12,0~255,0~255,0~255)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`将端口号${port} slot1的灯条的全部位置上亮起红色`, function() {
          let rgbLed = auriga.RgbLed(port, 1).position(0).rgb('#ff0000');
          let targetCmd = dataman.auriga.write.led[i];
          let currentCmd = formatProtocol(rgbLed.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      let positions = [0, 2, 13, -1];
      for (let i = 0; i < positions.length; i++) {
        let position = positions[i];
        it(`将端口号6 slot2 的灯条的 ${position}位置上亮起红色`, function() {
          let rgbLed = auriga.RgbLed(6, 2).position(position).rgb('#ff0000');
          let targetCmd = dataman.auriga.write.led[i + 5];
          let currentCmd = formatProtocol(rgbLed.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      it(`将端口号6 slot2的灯条的全部位置上亮起混合色`, function() {
        let rgbLed = auriga.RgbLed(6, 2).r(125).g(100).b(55);
        let targetCmd = dataman.auriga.write.led[9];
        let currentCmd = formatProtocol(rgbLed.protocol);
        expect(currentCmd).to.equal(targetCmd);
      });

      let colorsApi = ['blue', 'green', 'white'];
      for (let i = 0; i < colorsApi.length; i++) {
        let color = colorsApi[i];
        it(`将端口号6 slot2 的灯条的全部位置上亮起${color}`, function() {
          let rgbLed = (auriga.RgbLed(6, 2).position(0)[color])();
          let targetCmd = dataman.auriga.write.led[i + 10];
          let currentCmd = formatProtocol(rgbLed.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      it('将端口号6 slot2的灯条的全部位置上熄灭（turnOffAll)', function() {
        let rgbLed = auriga.RgbLed(6, 2).turnOffAll();
        let targetCmd = dataman.auriga.write.led[13];
        let currentCmd = formatProtocol(rgbLed.protocol);
        expect(currentCmd).to.equal(targetCmd);
      });

      it('将端口号6 slot2的灯条的全部位置上亮起红色（超出界限0～255）', function() {
        let rgbLed = auriga.RgbLed(6, 2).r(256).g(0).b(0);
        let targetCmd = dataman.auriga.write.led[14];
        let currentCmd = formatProtocol(rgbLed.protocol);
        expect(currentCmd).to.equal(targetCmd);
      });

      it('将端口号6 slot2的灯条的全部位置上不亮（超出界限0～255）', function() {
        let rgbLed = auriga.RgbLed(6, 2).r(0).g(-1).b(0);
        let targetCmd = dataman.auriga.write.led[15];
        let currentCmd = formatProtocol(rgbLed.protocol);
        expect(currentCmd).to.equal(targetCmd);
      });
    });

    describe('板载灯盘即板载灯：RgbLedOnBoard(0~12,0~255,0~255,0~255)', function() {
      let positions = [0, 2, 13, -1];
      for (let i = 0; i < positions.length; i++) {
        let position = positions[i];
        it(`将端口号6 slot2 的灯条的 ${position}位置上亮起红色`, function() {
          let ledPanelOnBoard = auriga.RgbLedOnBoard(6).position(position).r(256);
          let targetCmd = dataman.auriga.write.ledPanelOnBoard[i];
          let currentCmd = formatProtocol(ledPanelOnBoard.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });

    describe('四键led灯：setFourLeds(6～10，0~4,0~255,0~255,0~255)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`将端口号${port}上的四键led灯的全部位置上亮起红色`, function() {
          let fourLed = auriga.FourLeds(port).position(0).r(256);
          let targetCmd = dataman.auriga.write.fourLeds[i];
          let currentCmd = formatProtocol(fourLed.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      let positions = [2, 5, -1];
      for (let i = 0; i < positions.length; i++) {
        let position = positions[i];
        it(`将端口6上的四键led灯的 ${position}位置上亮起红色`, function() {
          let fourLed = auriga.FourLeds(6).position(position).r(256);
          let targetCmd = dataman.auriga.write.fourLeds[i + 5];
          let currentCmd = formatProtocol(fourLed.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });

    describe('主板通用命令：auriga.setFirmwareMode(0～4)', function() {
      let modes =     [0,         1,        2,       3,       4,     5,        -1,        3.5];
      let modeDescs = ['蓝牙模式', '自动避障', '平衡车', '红外线', '巡线', '错误模式', '错误模式', '错误模式'];
      for (let i = 0; i < modes.length; i++) {
        let mode = modes[i];
        let desc = modeDescs[i];
        it(`主板通用命令-设置模式为${desc}`, function() {
          let targetCmd = dataman.auriga.write.firmwareMode[i];
          auriga.setFirmwareMode(mode);
          expect(formatProtocol(auriga.protocol)).to.equal(targetCmd);
        });
      }
    });

    describe('数字舵机：ServoMotor(6~10,1/2,0~180)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`数字舵机在 port${port} slot1 旋转角度 90`, function() {
          let servoMotor = auriga.ServoMotor(port, 1).angle(90);
          let targetCmd = dataman.auriga.write.servo[i];
          let currentCmd = formatProtocol(servoMotor.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      it('数字舵机在端口6 slot2 旋转角度90', function() {
        let servoMotor = auriga.ServoMotor(6, 2).angle(90);
        let targetCmd = dataman.auriga.write.servo[5];
        let currentCmd = formatProtocol(servoMotor.protocol);
        expect(currentCmd).to.equal(targetCmd);
      });

      let angles = [0, 180, 181, -1];
      for (let i = 0; i < angles.length; i++) {
        let angle = angles[i];
        it(`数字舵机在端口6 slot1 旋转角度 ${angle}`, function() {
          let servoMotor = auriga.ServoMotor(6, 1).angle(angle);
          let targetCmd = dataman.auriga.write.servo[i+6];
          let currentCmd = formatProtocol(servoMotor.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      it(`数字舵机在端口6 slot1 旋转角度 跳到 0 度`, function() {
        let servoMotor = auriga.ServoMotor(6, 1).toStart();
        let targetCmd = dataman.auriga.write.servo[6];
        let currentCmd = formatProtocol(servoMotor.protocol);
        expect(currentCmd).to.equal(targetCmd);
      });

      it(`数字舵机在端口6 slot1 旋转角度 跳到 180 度`, function() {
        let servoMotor = auriga.ServoMotor(6, 1).toEnd();
        let targetCmd = dataman.auriga.write.servo[7];
        let currentCmd = formatProtocol(servoMotor.protocol);
        expect(currentCmd).to.equal(targetCmd);
      });
    });

    describe('四位七段数码管：SevenSegment(6～10，-2147483648～2147483647)', function() {
      let ports =   [6,   7,   8,   9,   10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`四位七段数码管在 port${port} 显示数值 100`, function() {
          let sevenSegment = auriga.SevenSegment(port).number(100);
          let targetCmd = dataman.auriga.write.sevenSegment[i];
          let currentCmd = formatProtocol(sevenSegment.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      let numbers = [0, -100, 2147483647, -2147483648, 1.63, 10.678, 2147483648, -2147483649];
      for (let i = 0; i < numbers.length; i++) {
        let number = numbers[i];
        it(`四位七段数码管在port 6 显示数值 ${number}`, function() {
          let sevenSegment = auriga.SevenSegment(6).number(number);
          let targetCmd = dataman.auriga.write.sevenSegment[i+5];
          let currentCmd = formatProtocol(sevenSegment.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });

    describe('表情面板：LedMatrix(6, 0, 1, "Hi")', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`在端口 ${port} x：0 y：0 的表情面板上显示字符串‘Hi’`, function() {
          let ledMatrixChar = auriga.LedMatrix(port).charMode().x(0).y(0).char('Hi');
          let targetCmd = dataman.auriga.write.ledMatrixChar[i];
          // console.log(auriga.LedMatrix(port).charMode(), ledMatrixChar.protocol);
          let currentCmd = formatProtocol(ledMatrixChar.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      let xy = [{x: 1, y:0}, {x: 0, y:1}, {x: 1, y:2}, {x: -1, y: 0},
        {x: 0, y: -4}, {x: -1, y: -5}
      ];
      for (let i = 0; i < xy.length; i++) {
        let x = xy[i].x;
        let y = xy[i].y;
        it(`在端口 6 x：${x} y：${y} 的表情面板上显示字符串‘Hi’`, function() {
          let ledMatrixChar = auriga.LedMatrix(6).charMode().x(x).y(y).char('Hi');
          let targetCmd = dataman.auriga.write.ledMatrixChar[i+5];
          let currentCmd = formatProtocol(ledMatrixChar.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      it(`在端口 7 x：1 y：1 的表情面板上显示字符串‘hello world’`, function() {
          let ledMatrixCharHelloWorld = auriga.LedMatrix(7).charMode().x(1).y(1).char('hello world');
          let targetCmd = 'ff 55 13 00 02 29 07 01 01 08 0b 68 65 6c 6c 6f 20 77 6f 72 6c 64';
          console.log('hello world', ledMatrixCharHelloWorld.protocol.join(','));
          let currentCmd = formatProtocol(ledMatrixCharHelloWorld.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
    });

    describe('表情面板-显示表情：setLedMatrixChar(6, 0, 0, "默认表情")', function() {
      it("在端口6 x：0 y：0的表情面板上显示表情‘？？’", function() { // 6 7 8 9 10
        let targetCmd = dataman.auriga.write.ledMatrixEmotion[0];
        let emotionStr = "00000000000000000001000000100000010000000010000000010010000000100000001000010010001000000100000000100000000100000000000000000000";
        // let emotionData = [00, 00, 0x40, 0x48, 0x44, 0x42, 0x02, 0x02, 0x02, 0x02, 0x42, 0x44, 0x48, 0x40, 0x00, 0x00];
        let LedMatrixEmotion = auriga.LedMatrix(6).emotionMode().x(0).y(0).emotion(emotionStr);
        let currentCmd = formatProtocol(LedMatrixEmotion.protocol);
        // console.log('LedMatrixEmotion.protocol', currentCmd)
        expect(currentCmd).to.equal(targetCmd);
      });
    })

    //   it("在端口6 x：1 y：0的表情面板上显示表情‘？？’", function() {
    //     var targetCmd = dataman.auriga.write.ledMatrixEmotion[5];
    //     var emotionData = [00, 00, 0x40, 0x48, 0x44, 0x42, 0x02, 0x02, 0x02, 0x02, 0x42, 0x44, 0x48, 0x40, 0x00, 0x00];
    //     var cmd = auriga.setLedMatrixEmotion(6, 1, 0, emotionData);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it("在端口6 x：0 y：1的表情面板上显示表情‘？？’", function() {
    //     var targetCmd = dataman.auriga.write.ledMatrixEmotion[6];
    //     var emotionData = [00, 00, 0x40, 0x48, 0x44, 0x42, 0x02, 0x02, 0x02, 0x02, 0x42, 0x44, 0x48, 0x40, 0x00, 0x00];
    //     var cmd = auriga.setLedMatrixEmotion(6, 0, 1, emotionData);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it("在端口6 x：1 y：2的表情面板上显示表情‘？？’", function() {
    //     var targetCmd = dataman.auriga.write.ledMatrixEmotion[7];
    //     var emotionData = [00, 00, 0x40, 0x48, 0x44, 0x42, 0x02, 0x02, 0x02, 0x02, 0x42, 0x44, 0x48, 0x40, 0x00, 0x00];
    //     var cmd = auriga.setLedMatrixEmotion(6, 1, 2, emotionData);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it("在端口6 x：-1 y：0的表情面板上显示表情‘？？’", function() {
    //     var targetCmd = dataman.auriga.write.ledMatrixEmotion[8];
    //     var emotionData = [00, 00, 0x40, 0x48, 0x44, 0x42, 0x02, 0x02, 0x02, 0x02, 0x42, 0x44, 0x48, 0x40, 0x00, 0x00];
    //     var cmd = auriga.setLedMatrixEmotion(6, -1, 0, emotionData);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it("在端口6 x：0 y：-4的表情面板上显示表情‘？？’", function() {
    //     var targetCmd = dataman.auriga.write.ledMatrixEmotion[9];
    //     var emotionData = [00, 00, 0x40, 0x48, 0x44, 0x42, 0x02, 0x02, 0x02, 0x02, 0x42, 0x44, 0x48, 0x40, 0x00, 0x00];
    //     var cmd = auriga.setLedMatrixEmotion(6, 0, -4, emotionData);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it("在端口6 x：-1 y：-5的表情面板上显示表情‘？？’", function() {
    //     var targetCmd = dataman.auriga.write.ledMatrixEmotion[10];
    //     var emotionData = [00, 00, 0x40, 0x48, 0x44, 0x42, 0x02, 0x02, 0x02, 0x02, 0x42, 0x44, 0x48, 0x40, 0x00, 0x00];
    //     var cmd = auriga.setLedMatrixEmotion(6, -1, -5, emotionData);
    //     assert.equal(targetCmd, cmd);
    //   });
    // });

    describe('表情面板显示时间-LedMatrixTime(6～10, 0/1, 0～23, 0～59)', function() {
      let ports =   [6,   7,   8,   9,   10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`在端口 port${port} 以分隔符‘:’显示时间10:20`, ()=>{
          let targetCmd = dataman.auriga.write.ledMatrixTime[i];
          let LedMatrixTime = auriga.LedMatrix(port).timeMode().hour(10).minute(20);
          let currentCmd = formatProtocol(LedMatrixTime.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      let hours =     [0,   23,   -1,  0,    23,  24, 'time',  15.5];
      let minutes =   [0,   59,   0,   -1,   60,  0,  1,      12];
      for (let i = 0; i < hours.length; i++) {
        let hour = hours[i];
        let minute = minutes[i];
        it(`在端口6上以分隔符 ':'显示时间${hour}:${minute}`, ()=>{
          let targetCmd = dataman.auriga.write.ledMatrixTime[i+6];
          let LedMatrixTime = auriga.LedMatrix(6).timeMode().hour(hour).minute(minute);
          let currentCmd = formatProtocol(LedMatrixTime.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    })
    //   it("在端口6上以分隔符‘ ’显示时间10 20 ", function() {
    //     var targetCmd = dataman.auriga.write.ledMatrixTime[5];
    //     var cmd = auriga.setLedMatrixTime(6, 0, 10, 20);
    //     assert.equal(targetCmd, cmd);
    //   });


    describe('表情面板-显示数字：LedMatrix(port).numberMode()', function() {
      let ports =   [6,   7,   8,   9,   10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`在端口 port${port} 上的表情面板显示数字0`, ()=>{
          let targetCmd = dataman.auriga.write.ledMatrixNumber[i];
          let LedMatrixNumber = auriga.LedMatrix(port).numberMode().number(0);
          let currentCmd = formatProtocol(LedMatrixNumber.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      let numbers =   [-1,1,12.25,2147483647,-2147483648, 2147483648, -2147483649, 'error'];
      for (let i = 0; i < numbers.length; i++) {
        let number = numbers[i];
        it(`在端口 port 6 上的表情面板显示数字 ${number}`, ()=>{
          let targetCmd = dataman.auriga.write.ledMatrixNumber[i+5];
          let LedMatrixNumber = auriga.LedMatrix(6).numberMode().number(number);
          // console.log(LedMatrixNumber.protocol)
          let currentCmd = formatProtocol(LedMatrixNumber.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    })

    // describe('快门线模块：setShutter(6, 2)', function() {
    //   it('在端口6的快门线设置为按下快门00 ', function() {
    //     var targetCmd = dataman.auriga.write.shutter[0];
    //     var cmd = auriga.setShutter(6, 0);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it('在端口7的快门线设置为按下快门00 ', function() {
    //     var targetCmd = dataman.auriga.write.shutter[1];
    //     var cmd = auriga.setShutter(7, 0);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it('在端口8的快门线设置为按下快门00 ', function() {
    //     var targetCmd = dataman.auriga.write.shutter[2];
    //     var cmd = auriga.setShutter(8, 0);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it('在端口9的快门线设置为按下快门00 ', function() {
    //     var targetCmd = dataman.auriga.write.shutter[3];
    //     var cmd = auriga.setShutter(9, 0);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it('在端口10的快门线设置为按下快门00 ', function() {
    //     var targetCmd = dataman.auriga.write.shutter[4];
    //     var cmd = auriga.setShutter(10, 0);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it('在端口6的快门线设置为松开快门01 ', function() {
    //     var targetCmd = dataman.auriga.write.shutter[5];
    //     var cmd = auriga.setShutter(6, 1);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it('在端口6的快门线设置为开始对焦02 ', function() {
    //     var targetCmd = dataman.auriga.write.shutter[6];
    //     var cmd = auriga.setShutter(6, 2);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it('在端口6的快门线设置为停止对焦03 ', function() {
    //     var targetCmd = dataman.auriga.write.shutter[7];
    //     var cmd = auriga.setShutter(6, 3);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it('在端口6的快门线设置为错误模式05 ', function() {
    //     var targetCmd = dataman.auriga.write.shutter[8];
    //     var cmd = auriga.setShutter(6, 5);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it('在端口6的快门线设置为错误模式-1 ', function() {
    //     var targetCmd = dataman.auriga.write.shutter[9];
    //     var cmd = auriga.setShutter(6, -1);
    //     assert.equal(targetCmd, cmd);
    //   });
    // });

    // describe('设置TONE输出：setTone("C2～D8", 125~2000)', function() {
    //   it('设置TONE输出C2(65)频率二分之一（500）节拍', function() {
    //     var targetCmd = dataman.auriga.write.tone[0];
    //     var toneData = "C2";
    //     var cmd = auriga.setTone(toneData, 500);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it('设置TONE输出A2(110)频率8分之一（125）节拍', function() {
    //     var targetCmd = dataman.auriga.write.tone[1];
    //     var toneData = "A2";
    //     var cmd = auriga.setTone(toneData, 125);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it('设置TONE输出B2(123)频率4分之一（250）节拍', function() {
    //     var targetCmd = dataman.auriga.write.tone[2];
    //     var toneData = "B2";
    //     var cmd = auriga.setTone(toneData, 250);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it('设置TONE输出D5(555)频率一（1000）节拍', function() {
    //     var targetCmd = dataman.auriga.write.tone[3];
    //     var toneData = "D5";
    //     var cmd = auriga.setTone(toneData, 1000);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it('设置TONE输出C7(2093)频率二（2000）节拍', function() {
    //     var targetCmd = dataman.auriga.write.tone[4];
    //     var toneData = "C7";
    //     var cmd = auriga.setTone(toneData, 2000);
    //     assert.equal(targetCmd, cmd);
    //   });

    //   it('设置TONE输出B7(3951)频率（500）停止节拍', function() {
    //     var targetCmd = dataman.auriga.write.tone[5];
    //     var toneData = "B7";
    //     var cmd = auriga.setTone(toneData, 0);//停止节拍在协议上也没有标注是多少
    //     assert.equal(targetCmd, cmd);
    //   });
    // });

    // describe('数字舵机2：xxxxxxx', function() {
    //     targetCmd = "xxxxxxxx";
    //     it(targetCmd + ' should be sent', function() {
    //         var cmd = auriga.setEncodeMotorxxxxx(1,100);
    //         console.log("the data from bluetooth: "+ cmd);
    //         assert.equal(targetCmd, cmd);
    //     });
    // });

    // describe('智能舵机：xxxxxxx', function() {
    //     targetCmd = "xxxxxxxx";
    //     it(targetCmd + ' should be sent', function() {
    //         var cmd = auriga.setEncodeMotorxxxxx(1,100);
    //         console.log("the data from bluetooth: "+ cmd);
    //         assert.equal(targetCmd, cmd);
    //     });
    // });
  });

  //重启命令
  describe('#它的重启命令', function() {
    describe('重启指令：reset()', function() {
      var targetCmd = dataman.auriga.write.reset[0];
      it(targetCmd + ' should be sent', function() {
        // var cmd = auriga.reset();
        // assert.equal(targetCmd, cmd);
      });
    });
  });

  //读指令:需要设备返回数据的指令
  describe('#读协议部分', function() {

    describe('读取版本号: auriga.getVersion(0)', function() {
      //未完成
      it('查询版本号的指令', function() {
        let targetCmd = dataman.auriga.read.version[0];
        let currentCmd = formatProtocol(auriga.readVersion().protocol);
        // console.log(currentCmd)
        expect(currentCmd).to.equal(targetCmd);
      });
    });

    describe('超声波传感器：Ultrasonic(6~10)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口号${port} 的超声波的指令`, function() {
          let ultrasonic = auriga.Ultrasonic(port);
          let targetCmd = dataman.auriga.read.ultrasonic[i];
          let currentCmd = formatProtocol(ultrasonic.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });

    describe('温度传感器：readTemperature(6～10,1/2)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口号${port} slot1 上的温度的指令`, function() {
          let temperature = auriga.Temperature(port, 1);
          let targetCmd = dataman.auriga.read.temperature[i];
          let currentCmd = formatProtocol(temperature.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      it(`发送读取端口号6 slot2 上的温度的指令`, function() {
        let temperature = auriga.Temperature(6, 2);
        let targetCmd = dataman.auriga.read.temperature[5];
        let currentCmd = formatProtocol(temperature.protocol);
        expect(currentCmd).to.equal(targetCmd);
      });
    });

    describe('光线传感器：readLight(6～12)', function() {
      let ports = [6, 7, 8, 9, 10, 11, 12];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口号${port} 的光线的指令`, function() {
          let light = auriga.Light(port);
          let targetCmd = dataman.auriga.read.light[i];
          let currentCmd = formatProtocol(light.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });

    describe('电位器传感器：Potentionmeter(6~10)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口号${port} 的电位器传感器的指令`, function() {
          let potentionmeter = auriga.Potentionmeter(port);
          let targetCmd = dataman.auriga.read.potentionmeter[i];
          let currentCmd = formatProtocol(potentionmeter.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });

    describe('摇杆传感器：Joystick(6~10).axis(1~2)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口号${port} 上的摇杆在 x 轴上的值的指令`, function() {
          let joystick = auriga.Joystick(port).axis(1);
          let targetCmd = dataman.auriga.read.joystick[i];
          let currentCmd = formatProtocol(joystick.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      it(`发送读取端口号6 上的摇杆在 y 轴上的值的指令`, function() {
          let joystick = auriga.Joystick(6).axis(2);
          let targetCmd = dataman.auriga.read.joystick[5];
          let currentCmd = formatProtocol(joystick.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
    });

    describe('姿态传感器（陀螺仪）板载和外接：Gyro(0,1/0,1~3)', function() {
      let axises = ['x', 'y', 'z'];
      for (let i = 0; i < axises.length; i++) {
        let axis = axises[i];
        it(`发送读取板载陀螺仪在 ${axis} 轴上的值的指令`, function() {
          let gyroOnBoard = auriga.GyroOnBoard().axis(i+1);
          let targetCmd = dataman.auriga.read.gyro[i];
          let currentCmd = formatProtocol(gyroOnBoard.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口 ${port} 上的陀螺仪在 x 轴上的值的指令`, function() {
          let gyro = auriga.Gyro(port).axis(1);
          let targetCmd = dataman.auriga.read.gyro[i+3];
          let currentCmd = formatProtocol(gyro.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      let yz = ['y', 'z'];
      for (let i = 0; i < yz.length; i++) {
        let axis = yz[i];
        it(`发送读取端口 6 上的陀螺仪在 ${axis} 轴上的值的指令`, function() {
          let gyro = auriga.Gyro(6).axis(i+2);
          let targetCmd = dataman.auriga.read.gyro[i+8];
          let currentCmd = formatProtocol(gyro.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });

    describe('音量传感器(含板载)：Sound(0,14／6～10)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口 ${port} 上的音量传感器的值的指令`, function() {
          let sound = auriga.Sound(port);
          let targetCmd = dataman.auriga.read.sound[i];
          let currentCmd = formatProtocol(sound.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
      //auriga 专有
      it('发送读取板载的音量传感器的值的指令', function() {
        let soundOnBoard = auriga.SoundOnBoard();
        let targetCmd = dataman.auriga.read.sound[5];
        let currentCmd = formatProtocol(soundOnBoard.protocol);
        expect(currentCmd).to.equal(targetCmd);
      });
    });

    describe('板载温度传感器：TemperatureOnBoard(0)', function() {
      it('发送读取板载温度传感器的值的指令', function() {
        let temperatureOnBoard = auriga.TemperatureOnBoard();
        let targetCmd = dataman.auriga.read.temperatureOnBoard[0];
        let currentCmd = formatProtocol(temperatureOnBoard.protocol);
        expect(currentCmd).to.equal(targetCmd);
      });
    });

    describe('被动式红外传感器：Pirmotion(0, 6)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口 ${port} 上的被动式红外传感器的值的指令`, function() {
          let pirmotion = auriga.Pirmotion(port);
          let targetCmd = dataman.auriga.read.pirmotion[i];
          let currentCmd = formatProtocol(pirmotion.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });


    describe('巡线传感器：LineFollower(0, 6~10)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口 ${port} 上的巡线传感器的值的指令`, function() {
          let lineFollower = auriga.LineFollower(port);
          let targetCmd = dataman.auriga.read.lineFollower[i];
          let currentCmd = formatProtocol(lineFollower.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });


    describe('限位开关传感器：LimitSwitch(0, 6～10, 1/2)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口 ${port} slot 1 上的限位开关的值的指令`, function() {
          let limitSwitch = auriga.LimitSwitch(port, 1);
          let targetCmd = dataman.auriga.read.limitSwitch[i];
          let currentCmd = formatProtocol(limitSwitch.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      it('发送读取端口 6 slot 2 上的限位开关的值的指令', function() {
        let limitSwitch = auriga.LimitSwitch(6, 2);
          let targetCmd = dataman.auriga.read.limitSwitch[5];
          let currentCmd = formatProtocol(limitSwitch.protocol);
          expect(currentCmd).to.equal(targetCmd);
      });
    });

    describe('电子罗盘传感器：Compass(0, 6)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口 ${port} 上的电子罗盘传感器的值的指令`, function() {
          let compass = auriga.Compass(port, 1);
          let targetCmd = dataman.auriga.read.compass[i];
          let currentCmd = formatProtocol(compass.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });


    describe('温湿度传感器：Humiture(0, 6～10, 1／0)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口 ${port} 上的温湿度传感器上的温度的指令`, function() {
          let humiture = auriga.Humiture(port).readTemperature();
          let targetCmd = dataman.auriga.read.humiture[i];
          let currentCmd = formatProtocol(humiture.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      it(`发送读取端口 6 上的温湿度传感器上的湿度的指令`, function() {
          let humiture = auriga.Humiture(6).readHumidity();
          let targetCmd = dataman.auriga.read.humiture[5];
          let currentCmd = formatProtocol(humiture.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
    });


    describe('火焰传感器：Flame(0, 6~10)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口 ${port} 上的火焰传感器的值的指令`, function() {
          let flame = auriga.Flame(port);
          let targetCmd = dataman.auriga.read.flame[i];
          let currentCmd = formatProtocol(flame.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });


    describe('气体传感器：Gas(0, 6~10)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口 ${port} 上的气体传感器的值的指令`, function() {
          let gas = auriga.Gas(port);
          let targetCmd = dataman.auriga.read.gas[i];
          let currentCmd = formatProtocol(gas.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });


    describe('触摸传感器：Touch(0, 6～10)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口 ${port} 上的触摸传感器的值的指令`, function() {
          let touch = auriga.Touch(port);
          let targetCmd = dataman.auriga.read.touch[i];
          let currentCmd = formatProtocol(touch.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });


    describe('按键传感器：FourKeys(0, 6, 1)', function() {
      let ports = [6, 7, 8, 9, 10];
      for (let i = 0; i < ports.length; i++) {
        let port = ports[i];
        it(`发送读取端口 ${port} 第 1 个按键的按键传感器的值的指令`, function() {
          let fourKeys = auriga.FourKeys(port).key(1);
          let targetCmd = dataman.auriga.read.fourKeys[i];
          let currentCmd = formatProtocol(fourKeys.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }

      let keys = [2,3,4];
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        it(`发送读取端口 6 第 ${key} 个按键的按键传感器的值的指令`, function() {
          let fourKeys = auriga.FourKeys(6).key(i+2);
          let targetCmd = dataman.auriga.read.fourKeys[i+5];
          let currentCmd = formatProtocol(fourKeys.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });


    describe('读取板载编码电机的速度：EncoderMotorOnBoard(0, 1／2, 2)', function() {
      let slots = [1, 2];
      for (let i = 0; i < slots.length; i++) {
        let slot = slots[i];
        it(`发送读取板载slot ${slot} 上的速度的指令`, function() {
          let encoderMotorOnBoard = auriga.EncoderMotorOnBoard(slot).readSpeed();
          let targetCmd = dataman.auriga.read.encoderMotorOnBoard[i];
          let currentCmd = formatProtocol(encoderMotorOnBoard.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });


    describe('读取板载编码电机的角度位置：EncoderMotorOnBoard(0, 1／2, 1)', function() {
      let slots = [1, 2];
      for (let i = 0; i < slots.length; i++) {
        let slot = slots[i];
        it(`发送读取板载slot ${slot} 上的位置的指令`, function() {
          let encoderMotorOnBoard = auriga.EncoderMotorOnBoard(slot).readAngle();
          let targetCmd = dataman.auriga.read.encoderMotorOnBoard[i+2];
          let currentCmd = formatProtocol(encoderMotorOnBoard.protocol);
          expect(currentCmd).to.equal(targetCmd);
        });
      }
    });


    describe('主板通用命令-读取电压：auriga.getVoltage(callback)', function() {
      // it(`发送读取主板电压的指令`, function() {
      //   let targetCmd = dataman.auriga.read.voltage[0];
      //   let currentCmd = formatProtocol(gyroOnBoard.protocol);
      //   expect(currentCmd).to.equal(targetCmd);
      // });
    });


    describe('主板通用命令-读取模式：auriga.getFirmwareMode(0, 113)', function() {
      // it('发送读取主板模式的指令', function() {
      //   let targetCmd = dataman.auriga.read.mode[0];
      //   let currentCmd = formatProtocol(gyroOnBoard.protocol);
      //   expect(currentCmd).to.equal(targetCmd);
      // });
    });
    //智能舵机
  });
});