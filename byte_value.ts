import { IntegerWithBitSize } from "./integer_with_bit_size";

export class ByteValue extends IntegerWithBitSize {
  static BITS = 8;
  constructor(number: number = 0) {
    super(ByteValue.BITS, number);
  }
}
