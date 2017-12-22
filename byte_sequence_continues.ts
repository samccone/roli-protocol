import { IntegerWithBitSize } from "./integer_with_bit_size";

export class ByteSequenceContinues extends IntegerWithBitSize {
  static BITS = 1;
  constructor(number: number = 0) {
    super(ByteSequenceContinues.BITS, number);
  }
}
