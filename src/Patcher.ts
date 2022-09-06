import { IPatchPattern } from "./patterns/IPatchPattern";
import PreparedPatchFile from "./PreparedPatchFile";

export interface FileWrapper {
  fileObject: File;
  isLoaded: boolean;
  type?: string;
}
/*
 | The following must be done in order to successfully patch a ROM file:
 | 1. Import patterns with the constructor:
 |    ex) const p = new Patcher([new UPSPattern, new IPSPattern]);
 | 2. Load patch file & rom file using loadPatchFile() and loadROMFile()
 | 3. loadFiles() must be called
 | 4. parseFile() must be called
 | 5. patch() returns the patched file.
 */
class Patcher {
  romFile!: FileWrapper;
  patchFile!: FileWrapper;
  loadedPatterns: IPatchPattern[];

  patternToUse!: IPatchPattern;

  constructor(patternsToLoad: IPatchPattern[]) {
    this.loadedPatterns = patternsToLoad;
  }

  async setPatchFile(patchFile: File): Promise<void> {
    this.patchFile = {
      fileObject: patchFile,
      isLoaded: true,
    };

    const header = (await PreparedPatchFile.create(patchFile)).readString(6);

    // Check which type of file it is, determine which pattern to use.
    for (const pattern of this.loadedPatterns) {
      if (pattern.belongsTo(header)) {
        this.patternToUse = pattern;
        this.patchFile.type = pattern.name();
        return;
      }
    }

    throw new Error("Cannot recognize type of ROM file");
  }

  setROMFile(romFile: File) {
    this.romFile = {
      fileObject: romFile,
      isLoaded: true,
    };
  }

  async loadFiles() {
    this.throwIfNotLoaded();
    await this.patternToUse.init(
      this.romFile.fileObject,
      this.patchFile.fileObject
    );
  }

  parseFile() {
    this.throwIfNotLoaded();
    this.patternToUse.parse();
  }

  patch(validateStrictly = false): PreparedPatchFile {
    this.throwIfNotLoaded();
    return this.patternToUse.patch(validateStrictly);
  }

  throwIfNotLoaded() {
    if (!(this.patchFile.isLoaded && this.romFile.isLoaded)) {
      throw new Error("File not loaded");
    }
  }

  get pattern() {
    return this.patternToUse.name();
  }

  get patterns(): string[] {
    return this.loadedPatterns.map((pattern) => pattern.name());
  }
}

export default Patcher;
