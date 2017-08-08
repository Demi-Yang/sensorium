import {
  validateNumber,
  warnParamNotInList
} from '../core/validate';
import Utils from '../core/utils';
import protocolAssembler from '../protocol/cmd';
import CommandManager from '../communicate/command-manager';
import { MOVE_DIRECTION } from '../mainboard/settings';

class PIDForDoubleMotor {
  constructor() {
    this.args = {
      distance: 0,
      direction: 1,
      speed: 0
    };
  }
  /**
   * set direction with a string argument
   * @param  {String} dir dir should be uppercase or lowercase of 'FORWARD'、'BACKWARD'、'TURNLEF'、'TURNRIGHT'
   */
  direction(dir) {
    dir = warnParamNotInList((dir||'').toUpperCase(), MOVE_DIRECTION);
    switch (dir) {
      case MOVE_DIRECTION[0]:
        this.args.direction = 1;
        break;
      case MOVE_DIRECTION[1]:
        this.args.direction = 2;
        break;
      case MOVE_DIRECTION[2]:
        this.args.direction = 3;
        break;
      case MOVE_DIRECTION[3]:
        this.args.direction = 4;
        break;
      default:
        this.args.direction = 1;
    }
    return this;
  }
  
  //direction + run
  forward() {
    this.args.direction = 1;
    return this.run();
  }

  //direction + run
  backward() {
    this.args.direction = 2;
    return this.run();
  }

  //direction + run
  turnleft() {
    this.args.direction = 3;
    return this.run();
  }
  
  //direction + run
  turnright() {
    this.args.direction = 4;
    return this.run();
  }

  /**
   * set distance
   * @param  {Number} distance 位移
   */
  distance(distance) {
    this.args.distance = validateNumber(distance, this.args.distance);
    return this;
  }

  /**
   * set speed
   * @param  {Number} speed [description]
   * @return {[type]}       [description]
   */
  speed(speed) {
    this.args.speed = validateNumber(speed, this.args.speed);
    return this;
  }

  run() {
    let buf = Utils.composer(protocolAssembler.setEncoderMotorPIDDoubleMotor, [this.args.direction, this.args.distance, this.args.speed]);
    CommandManager.write(buf);
    return this;
  }
}

export default PIDForDoubleMotor;