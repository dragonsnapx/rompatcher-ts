import type { IPatchPattern } from "./IPatchPattern";
import PreparedPatcherFile from "../PreparedPatchFile";
import { crc32 } from "../utils/crc";

interface UPSRecord {
  offset: number;
  XORData: number[];
}

export class UPSPattern implements IPatchPattern {
  MAGIC = "UPS1";
  EOF = 0x454f46;
  RECORD_RLE = 0x0000;

  records: UPSRecord[] = [];
  sizeInput = 0;
  sizeOutput = 0;
  checksumInput = 0;
  checksumOutput = 0;

  romFile!: PreparedPatcherFile;
  patchFile!: PreparedPatcherFile;

  belongsTo(header: string): boolean {
    return header.startsWith(this.MAGIC);
  }

  name() {
    return "ups";
  }

  async init(romFile: File, patchFile: File) {
    this.records = [];
    this.sizeInput = 0;
    this.sizeOutput = 0;
    this.checksumInput = 0;
    this.checksumOutput = 0;
    [this.romFile, this.patchFile] = await Promise.all([
      PreparedPatcherFile.create(romFile),
      PreparedPatcherFile.create(patchFile),
    ]);
  }

  patch(strictValidation: boolean): PreparedPatcherFile {
    if (strictValidation && !this.validate()) {
      throw new Error("Cannot validate CRC Input");
    }

    let outputSizeOutput = this.sizeOutput;
    let outputSizeInput = this.sizeInput;

    if (!strictValidation && outputSizeInput < this.romFile.fileSize) {
      outputSizeInput = this.romFile.fileSize;
      if (outputSizeOutput < outputSizeInput) {
        outputSizeOutput = outputSizeInput;
      }
    }

    const outputFile = PreparedPatcherFile.createEmpty(outputSizeOutput);
    this.romFile.copyTo(outputFile, 0, outputSizeInput);

    this.romFile.seek(0);

    for (let i = 0; i < this.records.length; i++) {
      const record = this.records[i];
      outputFile.skip(record.offset);
      this.romFile.skip(record.offset);

      for (let j = 0; j < record.XORData.length; j++) {
        outputFile.writeU8(
          (this.romFile.isEOF() ? 0x00 : this.romFile.readU8()) ^
            record.XORData[j]
        );
      }
      outputFile.skip(1);
      this.romFile.skip(1);
    }

    if (
      strictValidation &&
      crc32(outputFile, false, false) !== this.checksumOutput
    ) {
      throw new Error("Cannot verify CRC Output");
    }

    return outputFile;
  }

  parse(): void {
    this.patchFile.seek(this.MAGIC.length);
    this.sizeInput = UPSPattern.readVLV(this.patchFile);
    this.sizeOutput = UPSPattern.readVLV(this.patchFile);

    while (this.patchFile.offset < this.patchFile.fileSize - 12) {
      const relativeOffset = UPSPattern.readVLV(this.patchFile);

      const XORDiff = [];
      while (this.patchFile.readU8()) {
        XORDiff.push(this.patchFile.lastRead);
      }
      this.records.push({
        offset: relativeOffset,
        XORData: XORDiff as number[],
      });
    }

    this.checksumInput = this.patchFile.readU32(true);
    this.checksumOutput = this.patchFile.readU32(true);

    if (this.patchFile.readU32(true) !== crc32(this.patchFile, 0, true)) {
      throw new Error("Error while patching CRC File");
    }
  }

  private validate() {
    return crc32(this.romFile, false, false) === this.checksumInput;
  }

  private static readVLV(file: PreparedPatcherFile) {
    let data = 0;
    let shift = 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const buf = file.readU8();

      if (buf === -1) {
        throw new Error(
          `Cannot read UPS VLV at 0x${(file.offset - 1).toString(16)}`
        );
      }

      data += (buf & 0x7f) * shift;
      if ((buf & 0x80) !== 0) {
        break;
      }

      shift = shift << 7;
      data += shift;
    }

    return data;
  }
}
