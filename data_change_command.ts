import { IntegerWithBitSize } from "./integer_with_bit_size";

export class DataChangeCommand extends IntegerWithBitSize {
  static BITS = 3;
  constructor(number: number = 0) {
    super(DataChangeCommand.BITS, number);
  }
}
