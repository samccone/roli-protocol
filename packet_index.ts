import { IntegerWithBitSize } from "./integer_with_bit_size";

export class PacketIndex extends IntegerWithBitSize {
  static BITS = 16;
  constructor(number: number = 0) {
    super(PacketIndex.BITS, number);
  }
}
