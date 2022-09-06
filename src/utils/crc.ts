import type PreparedPatcherFile from "../PreparedPatchFile";

export function crc32Table() {
  const table = [];
  let value;
  for (let i = 0; i < 256; i++) {
    value = i;
    for (let k = 0; k < 8; k++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value;
  }

  return table;
}

export const CRC32_TABLE = crc32Table();

export function crc32(
  preparedPatcherFile: PreparedPatcherFile,
  headerSize: number | boolean,
  ignoreLastFourBytes: boolean
) {
  const data = headerSize
    ? new Uint8Array(preparedPatcherFile.u8Array.buffer, headerSize as number)
    : preparedPatcherFile.u8Array;
  let crc = 0 ^ -1;

  const length = ignoreLastFourBytes ? data.length - 4 : data.length;
  for (let i = 0; i < length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ data[i]) & 0xff];
  }

  return (crc ^ -1) >>> 0;
}
