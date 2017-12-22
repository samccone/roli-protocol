import { IntegerWithBitSize } from "./integer_with_bit_size";

export class ProtocolVersion extends IntegerWithBitSize {
  static BITS = 8;
  constructor(number: number = 0) {
    super(ProtocolVersion.BITS, number);
  }
}
