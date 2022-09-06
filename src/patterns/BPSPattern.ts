import type { IPatchPattern } from "./IPatchPattern";
import PreparedPatcherFile from "../PreparedPatchFile";
import { crc32 } from "../utils/crc";

enum BPSAction {
  SourceRead,
  TargetRead,
  SourceCopy,
  TargetCopy,
}

interface BPSActions {
  type: BPSAction;
  length: number;
  bytes?: number[];
  relativeOffset?: number;
}

export class BPSPattern implements IPatchPattern {
  MAGIC = "BPS1";
  actions: BPSActions[] = [];

  sourceSize!: number;
  targetSize!: number;
  metadata!: string;

  romFile!: PreparedPatcherFile;
  patchFile!: PreparedPatcherFile;

  sourceChecksum!: number;
  targetChecksum!: number;
  patchChecksum!: number;

  belongsTo(header: string): boolean {
    return header.startsWith(this.MAGIC);
  }

  async init(romFile: File, patchFile: File) {
    this.actions = [];
    this.sourceSize = 0;
    this.targetSize = 0;
    this.metadata = "";
    this.sourceChecksum = this.targetChecksum = this.patchChecksum = 0;
    [this.romFile, this.patchFile] = await Promise.all([
      PreparedPatcherFile.create(romFile),
      PreparedPatcherFile.create(patchFile),
    ]);
  }

  name(): string {
    return "bps";
  }

  parse(): void {
    this.patchFile.seek(this.MAGIC.length);
    this.sourceSize = this.readVLV();
    this.targetSize = this.readVLV();

    const metadataLength = this.readVLV();
    if (metadataLength) {
      this.metadata = this.patchFile.readString(metadataLength);
    }

    const endActionOffset = this.patchFile.fileSize - 12;
    while (this.patchFile.offset < endActionOffset) {
      const data = this.readVLV();
      const action: BPSActions = {
        type: data & (3 as BPSAction),
        length: (data >> 2) + 1,
      };

      if (action.type === BPSAction.TargetRead) {
        action.bytes = this.patchFile.readBytes(action.length);
      } else if (
        action.type === BPSAction.SourceCopy ||
        action.type === BPSAction.TargetCopy
      ) {
        const relativeOffset = this.readVLV();
        action.relativeOffset =
          (relativeOffset & 1 ? -1 : 1) * (relativeOffset >> 1);
      }

      this.actions.push(action);
    }

    this.sourceChecksum = this.patchFile.readU32(true);
    this.targetChecksum = this.patchFile.readU32(true);
    this.patchChecksum = this.patchFile.readU32(true);

    if (this.patchChecksum !== crc32(this.patchFile, 0, true)) {
      throw new Error("Cannot verify CRC Patch");
    }
  }

  patch(strictValidation: boolean): PreparedPatcherFile {
    if (strictValidation && !this.validate()) {
      throw new Error("Cannot verify CRC input");
    }

    const outputFile = PreparedPatcherFile.createEmpty(this.targetSize);

    let sourceRelativeOffset = 0;
    let targetRelativeOffset = 0;

    this.actions.forEach((action) => {
      switch (action.type) {
        case BPSAction.SourceRead:
          this.romFile.copyTo(outputFile, outputFile.offset, action.length);
          outputFile.skip(action.length);
          break;
        case BPSAction.TargetRead:
          outputFile.writeBytes(action.bytes as number[]);
          break;
        case BPSAction.SourceCopy:
          sourceRelativeOffset += action.relativeOffset as number;
          for (let i = 0; i < action.length; i++) {
            outputFile.writeU8(this.romFile.u8Array[sourceRelativeOffset]);
            sourceRelativeOffset++;
          }
          break;
        case BPSAction.TargetCopy:
          targetRelativeOffset = action.relativeOffset as number;
          for (let i = 0; i < action.length; i++) {
            outputFile.writeU8(this.romFile.u8Array[targetRelativeOffset]);
            targetRelativeOffset++;
          }
          break;
      }
    });

    if (
      strictValidation &&
      crc32(outputFile, false, false) !== this.targetChecksum
    ) {
      throw new Error("Cannot verify CRC Output");
    }

    return outputFile;
  }

  private validate() {
    return this.sourceChecksum === crc32(this.romFile, 0, false);
  }

  private readVLV() {
    let data = 0;
    let shift = 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const buf = this.patchFile.readU8();
      data += (buf & 0x7f) * shift;
      if (buf & 0x80) {
        break;
      }
      shift <<= 7;
      data += shift;
    }

    this.patchFile.lastRead = data;
    return data;
  }
}
