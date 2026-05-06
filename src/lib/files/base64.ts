export function normalizeBase64Data(data: string): string {
  const marker = "base64,";
  const markerIndex = data.indexOf(marker);
  const base64Data = markerIndex >= 0 ? data.slice(markerIndex + marker.length) : data;

  return base64Data.replace(/\s/g, "");
}

export function base64ToUint8Array(data: string): Uint8Array {
  const binaryString = atob(normalizeBase64Data(data));
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return bytes;
}

export function base64ToBlob(data: string, mimeType: string): Blob {
  const bytes = base64ToUint8Array(data);
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;

  return new Blob([arrayBuffer], { type: mimeType });
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binaryString = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binaryString += String.fromCharCode(...chunk);
  }

  return btoa(binaryString);
}
