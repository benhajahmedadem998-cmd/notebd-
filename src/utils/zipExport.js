function buildCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let value = n;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) !== 0 ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    }
    table[n] = value >>> 0;
  }
  return table;
}

const CRC_LOOKUP = buildCrcTable();

function computeCrc32(buffer) {
  let state = 0xffffffff;
  for (let idx = 0; idx < buffer.length; idx += 1) {
    state = CRC_LOOKUP[(state ^ buffer[idx]) & 0xff] ^ (state >>> 8);
  }
  return (state ^ 0xffffffff) >>> 0;
}

export function createZipBlob(files) {
  const utf8 = new TextEncoder();
  const bodyChunks = [];
  const directoryChunks = [];
  let cursor = 0;

  for (const item of files) {
    const pathBytes = utf8.encode(item.name);
    const payloadBytes = utf8.encode(item.content);
    const crc = computeCrc32(payloadBytes);

    const header = new Uint8Array(30 + pathBytes.length);
    const hView = new DataView(header.buffer);
    hView.setUint32(0, 0x04034b50, true);
    hView.setUint16(4, 20, true);
    hView.setUint16(6, 0x0800, true);
    hView.setUint16(8, 0, true);
    hView.setUint32(14, crc, true);
    hView.setUint32(18, payloadBytes.length, true);
    hView.setUint32(22, payloadBytes.length, true);
    hView.setUint16(26, pathBytes.length, true);
    header.set(pathBytes, 30);

    bodyChunks.push(header, payloadBytes);

    const central = new Uint8Array(46 + pathBytes.length);
    const cView = new DataView(central.buffer);
    cView.setUint32(0, 0x02014b50, true);
    cView.setUint16(4, 20, true);
    cView.setUint16(6, 20, true);
    cView.setUint16(8, 0x0800, true);
    cView.setUint16(10, 0, true);
    cView.setUint32(16, crc, true);
    cView.setUint32(20, payloadBytes.length, true);
    cView.setUint32(24, payloadBytes.length, true);
    cView.setUint16(28, pathBytes.length, true);
    cView.setUint32(42, cursor, true);
    central.set(pathBytes, 46);

    directoryChunks.push(central);
    cursor += header.length + payloadBytes.length;
  }

  let directorySize = 0;
  for (const chunk of directoryChunks) {
    directorySize += chunk.length;
  }

  const trailer = new Uint8Array(22);
  const tView = new DataView(trailer.buffer);
  tView.setUint32(0, 0x06054b50, true);
  tView.setUint16(8, files.length, true);
  tView.setUint16(10, files.length, true);
  tView.setUint32(12, directorySize, true);
  tView.setUint32(16, cursor, true);

  return new Blob([...bodyChunks, ...directoryChunks, trailer], {
    type: 'application/zip',
  });
}

export function triggerFileDownload(filename, content) {
  const blob =
    content instanceof Blob
      ? content
      : new Blob([content], { type: 'text/plain;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1200);
}
