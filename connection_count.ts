import { IntegerWithBitSize } from "./integer_with_bit_size";

export class ConnectionCount extends IntegerWithBitSize {
  static BITS = 7;
  constructor(number: number = 0) {
    super(ConnectionCount.BITS, number);
  }
}
