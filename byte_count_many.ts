import { IntegerWithBitSize } from "./integer_with_bit_size";

export class ByteCountMany extends IntegerWithBitSize {
  static BITS = 8;
  constructor(number: number = 0) {
    super(ByteCountMany.BITS, number);
  }
}
