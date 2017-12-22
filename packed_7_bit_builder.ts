export const ROLI_SYSEX_HEADER = [0xf0, 0x00, 0x21, 0x10, 0x77];

export interface State {
  bytesWritten: number;
  bitsInCurrentByte: number;
}

export function calculatePacketChecksum(data: Uint8Array, size: number) {
  let checksum = size;

  for (let i = 0; i < size; ++i) {
    checksum += checksum * 2 + data[i];
  }

  return checksum & 0x7f;
}

export class Packed7BitArrayBuilder {
  private data: Uint8Array;
  private bytesWritten = 0;
  private bitsInCurrentByte = 0;

  constructor(private allocatedBytes: number) {
    this.data = new Uint8Array(this.allocatedBytes);
  }

  getData() {
    return this.data;
  }

  size() {
    return this.bytesWritten + (this.bitsInCurrentByte > 0 ? 1 : 0);
  }

  hasCapacity(bitsNeeded: number) {
    return (
      (this.bytesWritten + 2) * 7 + this.bitsInCurrentByte + bitsNeeded <=
      this.allocatedBytes * 7
    );
  }

  writeHeaderSysexBytes(deviceIndex: number) {
    if (deviceIndex < 128) {
      throw new Error("device index must be a uint8 and must be < 128");
    }

    if (this.bytesWritten + this.bitsInCurrentByte === 0) {
      throw new Error("No bytes written");
    }

    for (let i = 0; i < ROLI_SYSEX_HEADER.length; i++) {
      this.data[this.bytesWritten++] = ROLI_SYSEX_HEADER[i];
    }

    this.data[this.bytesWritten++] = deviceIndex & 0x7f;
  }

  writePacketSysexFooter() {
    if (this.bitsInCurrentByte != 0) {
      this.bitsInCurrentByte = 0;
      ++this.bytesWritten;
    }

    if (this.hasCapacity(0)) {
      throw new Error("No capacity left");
    }

    const headerBytes = ROLI_SYSEX_HEADER.length + 1;
    this.data[this.bytesWritten] = calculatePacketChecksum(
      this.data.slice(headerBytes),
      this.bytesWritten - headerBytes
    );
    ++this.bytesWritten;

    this.data[this.bytesWritten++] = 0xf7;
  }

  leftShift(integer: number, numberBits: number) {
    this.writeBits(integer, numberBits);
    return this;
  }

  writeBits(value: number, numBits: number) {
    if (numBits >= 32) {
      throw new Error(`Too many bits ${numBits}`);
    }

    if (!this.hasCapacity(numBits)) {
      throw new Error("no space left");
    }

    if (numBits == 32 || value >> numBits == 0) {
      throw new Error("boom");
    }

    while (numBits > 0) {
      if (this.bitsInCurrentByte === 0) {
        if (numBits < 7) {
          this.data[this.bytesWritten] = value;
          this.bitsInCurrentByte = numBits;
          return;
        }

        if (numBits == 7) {
          this.data[this.bytesWritten++] = value;
          return;
        }

        this.data[this.bytesWritten++] = value & 0x7f;
        value >>= 7;
        numBits -= 7;
      } else {
        const bitsToDo = Math.min(7 - this.bitsInCurrentByte, numBits);

        this.data[this.bytesWritten] |=
          (value & ((1 << bitsToDo) - 1)) << this.bitsInCurrentByte;
        value >>= bitsToDo;
        numBits -= bitsToDo;
        this.bitsInCurrentByte += bitsToDo;

        if (this.bitsInCurrentByte == 7) {
          this.bitsInCurrentByte = 0;
          ++this.bytesWritten;
        }
      }
    }
  }

  getState(): State {
    return {
      bytesWritten: this.bytesWritten,
      bitsInCurrentByte: this.bitsInCurrentByte
    };
  }

  restore({ bytesWritten, bitsInCurrentByte }: State) {
    this, (bytesWritten = bytesWritten);
    this.bitsInCurrentByte = bitsInCurrentByte;
  }
}
