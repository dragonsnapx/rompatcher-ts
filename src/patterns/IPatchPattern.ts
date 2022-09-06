import PreparedPatchFile from "../PreparedPatchFile";

export interface IPatchPattern {
  MAGIC: string;

  init(romFile: File, patchFile: File): void;
  parse(): void;
  patch(strictValidation?: boolean): PreparedPatchFile;
  belongsTo(header: string): boolean;
  name(): string;
}
