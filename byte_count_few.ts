import { IntegerWithBitSize } from "./integer_with_bit_size";

export class ByteCountFew extends IntegerWithBitSize {
  static BITS = 4;
  constructor(number: number = 0) {
    super(ByteCountFew.BITS, number);
  }
}
