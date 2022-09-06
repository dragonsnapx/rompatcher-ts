export async function hashFile(file: File, algo = "SHA-256") {
  const buffer = await fileToBuffer(file);
  const hash = await window.crypto.subtle.digest(
    {
      name: algo,
    },
    buffer
  );
  return convertArrayBufferToHexaDecimal(hash);
}

export function convertArrayBufferToHexaDecimal(arrayBuffer: ArrayBuffer) {
  const dataView = new DataView(arrayBuffer);
  let hex = "";

  for (
    let index = 0, length = dataView.byteLength;
    index < length;
    index += 1
  ) {
    let buf = dataView.getUint8(index).toString(16);
    if (buf.length < 2) {
      buf = "0" + buf;
    }
    hex += buf;
  }

  return hex;
}

export async function fileToBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const arrayBuffer = reader.result;
      resolve(arrayBuffer as ArrayBufferLike);
    };
  });
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop() as string;
}

export function stripFileExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}
