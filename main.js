define("main", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function run() {
        console.log("yo");
    }
    exports.run = run;
});
define("packed_7_bit_builder", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ROLI_SYSEX_HEADER = [0xf0, 0x00, 0x21, 0x10, 0x77];
    function calculatePacketChecksum(data, size) {
        let checksum = size;
        for (let i = 0; i < size; ++i) {
            checksum += checksum * 2 + data[i];
        }
        return checksum & 0x7f;
    }
    exports.calculatePacketChecksum = calculatePacketChecksum;
    class Packed7BitArrayBuilder {
        constructor(allocatedBytes) {
            this.allocatedBytes = allocatedBytes;
            this.bytesWritten = 0;
            this.bitsInCurrentByte = 0;
            this.data = new Uint8Array(this.allocatedBytes);
        }
        getData() {
            return this.data;
        }
        size() {
            return this.bytesWritten + (this.bitsInCurrentByte > 0 ? 1 : 0);
        }
        hasCapacity(bitsNeeded) {
            return ((this.bytesWritten + 2) * 7 + this.bitsInCurrentByte + bitsNeeded <=
                this.allocatedBytes * 7);
        }
        writeHeaderSysexBytes(deviceIndex) {
            if (deviceIndex < 128) {
                throw new Error("device index must be a uint8 and must be < 128");
            }
            if (this.bytesWritten + this.bitsInCurrentByte === 0) {
                throw new Error("No bytes written");
            }
            for (let i = 0; i < exports.ROLI_SYSEX_HEADER.length; i++) {
                this.data[this.bytesWritten++] = exports.ROLI_SYSEX_HEADER[i];
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
            const headerBytes = exports.ROLI_SYSEX_HEADER.length + 1;
            this.data[this.bytesWritten] = calculatePacketChecksum(this.data.slice(headerBytes), this.bytesWritten - headerBytes);
            ++this.bytesWritten;
            this.data[this.bytesWritten++] = 0xf7;
        }
        leftShift(integer, numberBits) {
            this.writeBits(integer, numberBits);
            return this;
        }
        writeBits(value, numBits) {
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
                }
                else {
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
        getState() {
            return {
                bytesWritten: this.bytesWritten,
                bitsInCurrentByte: this.bitsInCurrentByte
            };
        }
        restore({ bytesWritten, bitsInCurrentByte }) {
            this, (bytesWritten = bytesWritten);
            this.bitsInCurrentByte = bitsInCurrentByte;
        }
    }
    exports.Packed7BitArrayBuilder = Packed7BitArrayBuilder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiLCJwYWNrZWRfN19iaXRfYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFBQTtRQUNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUZELGtCQUVDOzs7OztJQ0ZZLFFBQUEsaUJBQWlCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFPaEUsaUNBQXdDLElBQWdCLEVBQUUsSUFBWTtRQUNwRSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFFcEIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUM5QixRQUFRLElBQUksUUFBUSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ3pCLENBQUM7SUFSRCwwREFRQztJQUVEO1FBS0UsWUFBb0IsY0FBc0I7WUFBdEIsbUJBQWMsR0FBZCxjQUFjLENBQVE7WUFIbEMsaUJBQVksR0FBRyxDQUFDLENBQUM7WUFDakIsc0JBQWlCLEdBQUcsQ0FBQyxDQUFDO1lBRzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFFRCxPQUFPO1lBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbkIsQ0FBQztRQUVELElBQUk7WUFDRixNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FB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