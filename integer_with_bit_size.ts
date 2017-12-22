import { Packed7BitArrayBuilder } from "./packed_7_bit_builder";

export class IntegerWithBitSize {
  value: number;

  static maxValue(bits: number) {
    // (1ULL << this.bits) - 1ULL);
    return parseInt(new Array(bits).fill(1).join(), 2);
  }

  constructor(private _bits: number, value = 0) {
    if (_bits > 32) {
      throw new Error("bits must be <= 32");
    }

    this.value = value;
  }

  get bits() {
    return this._bits;
  }

  get maxValue() {
    // (1ULL << this.bits) - 1ULL);
    return parseInt(new Array(this.bits).fill(1).join(), 2);
  }

  getScaledToByte() {
    return this.bits < 8
      ? this.value << (8 - this.bits)
      : this.value >> (this.bits - 8);
  }

  /*
    float toUnipolarFloat() const noexcept      { return value / (float) maxValue; }
    float toBipolarFloat() const noexcept       { return static_cast<int32> (value << (32 - numBits)) / (float) 0x80000000u; }
    
    static IntegerWithBitSize fromUnipolarFloat (float value) noexcept
    {
        static_assert (numBits <= 31, "numBits must be <= 31");
        return IntegerWithBitSize ((uint32) jlimit (0, (int) maxValue, (int) (value * maxValue)));
    }
    
    static IntegerWithBitSize fromBipolarFloat (float value) noexcept
    {
        static_assert (numBits <= 31, "numBits must be <= 31");
        return IntegerWithBitSize (maxValue & (uint32) jlimit ((int) -(maxValue / 2), (int) (maxValue / 2), (int) (value * (maxValue / 2))));
    }
    */
}
