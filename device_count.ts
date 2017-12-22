import { IntegerWithBitSize } from "./integer_with_bit_size";

export class DeviceCount extends IntegerWithBitSize {
  static BITS = 7;
  constructor(number: number = 0) {
    super(DeviceCount.BITS, number);
  }
}
