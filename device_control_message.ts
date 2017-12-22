import { IntegerWithBitSize } from "./integer_with_bit_size";

export class DeviceControlMessage extends IntegerWithBitSize {
  static BITS = 9;
  constructor(number: number = 0) {
    super(DeviceControlMessage.BITS, number);
  }
}
