import type { IPatchPattern } from "./IPatchPattern";
import PreparedPatcherFile from "../PreparedPatchFile";

interface IPSRecord {
  offset: number;
  type: number;
  length: number;
  byte?: number;
  data?: number[];
}

export class IPSPattern implements IPatchPattern {
  MAGIC = "PATCH";
  EOF = 0x454f46;
  RECORD_RLE = 0x0000;
  RECORD_SIMPLE = 0x01;

  records: IPSRecord[] = [];
  truncate?: number;

  romFile!: PreparedPatcherFile;
  patchFile!: PreparedPatcherFile;

  belongsTo(header: string): boolean {
    return header.startsWith(this.MAGIC);
  }

  async init(romFile: File, patchFile: File) {
    this.records = [];
    this.truncate = undefined;
    [this.romFile, this.patchFile] = await Promise.all([
      PreparedPatcherFile.create(romFile),
      PreparedPatcherFile.create(patchFile),
    ]);
  }

  name(): string {
    return "ips";
  }

  parse(): void {
    this.patchFile.seek(this.MAGIC.length);

    while (!this.patchFile.isEOF()) {
      const offset = this.patchFile.readU24();

      if (offset === this.EOF) {
        if (this.patchFile.isEOF()) {
          break;
        } else if (this.patchFile.offset + 3 === this.patchFile.fileSize) {
          this.truncate = this.patchFile.readU24();
        }
      }

      const length = this.patchFile.readU16();

      if (length === this.RECORD_RLE) {
        // RLE
        this.records.push({
          offset,
          type: this.RECORD_RLE,
          length: this.patchFile.readU16(),
          byte: this.patchFile.readU8(),
        });
      } else {
        // Simple
        this.records.push({
          offset,
          type: this.RECORD_SIMPLE,
          length,
          data: this.patchFile.readBytes(length),
        });
      }
    }
  }

  patch(): PreparedPatcherFile {
    let outputFile: PreparedPatcherFile;

    if (this.truncate) {
      if (this.truncate > this.romFile.fileSize) {
        outputFile = PreparedPatcherFile.createEmpty(this.truncate);
        this.romFile.copyTo(outputFile, 0, this.romFile.fileSize, 0);
      } else {
        outputFile = this.romFile.slice(0, this.truncate);
      }
    } else {
      let outputFileSize = this.romFile.fileSize;
      for (const record of this.records) {
        if (record.type === this.RECORD_RLE) {
          if (record.offset + record.length > outputFileSize) {
            outputFileSize = record.offset + record.length;
          }
        } else {
          if (record.offset + record.length > outputFileSize) {
            outputFileSize = record.offset + (record.data as number[]).length;
          }
        }
      }

      if (outputFileSize === this.romFile.fileSize) {
        outputFile = this.romFile.slice(0, this.romFile.fileSize);
      } else {
        outputFile = PreparedPatcherFile.createEmpty(outputFileSize);
        this.romFile.copyTo(outputFile, 0);
      }
    }

    this.romFile.seek(0);

    for (const record of this.records) {
      outputFile.seek(record.offset);
      if (record.type === this.RECORD_RLE) {
        for (let i = 0; i < record.length; i++) {
          outputFile.writeU8(record.byte as number);
        }
      } else {
        outputFile.writeBytes(record.data as number[]);
      }
    }

    return outputFile;
  }
}
