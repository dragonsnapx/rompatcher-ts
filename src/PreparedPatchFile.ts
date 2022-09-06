import { fileToBuffer } from "./utils";

export default class PreparedPatchFile {
  private _offset = 0;
  private _lastRead: string | number | null | number[] = null;
  private _u8Array!: Uint8Array;

  private readonly useLittleEndian;
  private _fileSize!: number;
  private _fileType!: string;
  private _fileName!: string;

  private constructor() {
    this.useLittleEndian = false;
  }

  public static async create(file: File) {
    const instance = new PreparedPatchFile();
    await instance.load(file);
    return instance;
  }

  public static createEmpty(size: number) {
    const instance = new PreparedPatchFile();
    instance._fileName = "file.bin";
    instance._fileType = "application/octet-stream";
    instance._fileSize = size;

    const buffer = new ArrayBuffer(size);
    instance._u8Array = new Uint8Array(buffer);

    return instance;
  }

  public async load(file: File) {
    this._fileSize = file.size;
    this._fileType = file.type;
    this._fileName = file.name;

    const buffer = await fileToBuffer(file);

    this._u8Array = new Uint8Array(buffer);
  }

  public copyTo(
    target: PreparedPatchFile,
    offsetSource: number,
    length?: number,
    offsetTarget: number = offsetSource
  ) {
    const len = length || this._fileSize - offsetSource;

    for (let i = 0; i < len; i++) {
      target._u8Array[offsetTarget + i] = this._u8Array[offsetSource + i];
    }
  }

  public seek(offset: number) {
    this._offset = offset;
  }

  public skip(bytes: number) {
    this._offset += bytes;
  }

  public slice(offset: number, length?: number) {
    const len = length || this._fileSize - offset;
    let newFile;

    if (typeof this._u8Array.buffer.slice !== undefined) {
      newFile = PreparedPatchFile.createEmpty(0);
      newFile._fileSize = len;
      newFile._u8Array = new Uint8Array(
        this._u8Array.buffer.slice(offset, offset + len)
      );
    } else {
      newFile = PreparedPatchFile.createEmpty(len);
      this.copyTo(newFile, offset, len, 0);
    }

    newFile._fileName = this._fileName;
    newFile._fileType = this._fileType;
    return newFile;
  }

  public isEOF(): boolean {
    return !(this._offset < this._fileSize);
  }

  public readString(len: number): string {
    this._lastRead = "";
    for (
      let i = 0;
      i < len &&
      this._offset + i < this._fileSize &&
      this._u8Array[this._offset + i] > 0;
      i++
    ) {
      this._lastRead =
        this._lastRead + String.fromCharCode(this._u8Array[this._offset + i]);
    }
    this._offset += len;
    return this._lastRead;
  }

  public readBytes(length: number) {
    this._lastRead = new Array(length);
    for (let i = 0; i < length; i++) {
      this._lastRead[i] = this._u8Array[this._offset + i];
    }
    this._offset += length;
    return this._lastRead;
  }

  public writeBytes(bytes: number[]) {
    for (let i = 0; i < bytes.length; i++) {
      this._u8Array[this._offset + i] = bytes[i];
    }

    this._offset += bytes.length;
  }

  public readU8() {
    this._lastRead = this._u8Array[this._offset];
    this._offset++;
    return this._lastRead;
  }

  public writeU8(data: number) {
    this._u8Array[this._offset] = data;
    this._offset++;
  }

  public readU16(forceLittleEndian = false) {
    if (forceLittleEndian || this.useLittleEndian) {
      this._lastRead =
        this._u8Array[this._offset] + (this._u8Array[this._offset + 1] << 8);
    } else {
      this._lastRead =
        (this._u8Array[this._offset] << 8) + this._u8Array[this._offset + 1];
    }

    this._offset += 2;
    return this._lastRead >>> 0;
  }

  public readU24(forceLittleEndian = false) {
    if (forceLittleEndian || this.useLittleEndian) {
      this._lastRead =
        this._u8Array[this._offset] +
        (this._u8Array[this._offset + 1] << 8) +
        (this._u8Array[this._offset + 2] << 16);
    } else {
      this._lastRead =
        (this._u8Array[this._offset] << 16) +
        (this._u8Array[this._offset + 1] << 8) +
        this._u8Array[this._offset + 2];
    }

    this._offset += 3;
    return this._lastRead >>> 0;
  }

  public readU32(forceLittleEndian = false) {
    if (forceLittleEndian || this.useLittleEndian) {
      this._lastRead =
        this._u8Array[this._offset] +
        (this._u8Array[this._offset + 1] << 8) +
        (this._u8Array[this._offset + 2] << 16) +
        (this._u8Array[this._offset + 3] << 24);
    } else {
      this._lastRead =
        (this._u8Array[this._offset] << 24) +
        (this._u8Array[this._offset + 1] << 16) +
        (this._u8Array[this._offset + 2] << 8) +
        this._u8Array[this._offset + 3];
    }

    this._offset += 4;
    return this._lastRead >>> 0;
  }

  get offset() {
    return this._offset;
  }

  get fileSize() {
    return this._fileSize;
  }

  get lastRead() {
    return this._lastRead;
  }

  set lastRead(data) {
    this._lastRead = data;
  }

  get u8Array() {
    return this._u8Array;
  }

  public export() {
    return new Blob([this._u8Array], { type: this._fileType });
  }

  // public download(fileName: string) {
  // 	saveAs(this.export(), fileName);
  // }
}
