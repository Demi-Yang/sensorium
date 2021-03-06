import {
  validateNumber
} from '../core/validate';
import {
  composer
} from '../core/utils';
import protocolAssembler from '../protocol/cmd';
import Control from '../core/control';

class PIDForDistance {
  constructor(slot) {
    this.args = {
      distance: 0,
      speed: 0,
      slot: validateNumber(slot, 1)
    };
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
   * @param  {Number} speed 速度
   */
  speed(speed) {
    this.args.speed = validateNumber(speed, this.args.speed);
    return this;
  }

  /**
   * getter of protocol
   */
  get protocol() {
    return composer(protocolAssembler.setEncoderMotorPIDDistance, [this.args.slot, this.args.distance, this.args.speed]);
  }

  /**
   * run
   */
  run() {
    Control.write(this.protocol);
    return this;
  }
}

export default PIDForDistance;