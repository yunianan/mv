// 用 @xnb-js 解 Stardew 的 .xnb（1.6 用 LZX 压缩）→ PNG
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { bufferToXnb, setReaders } from '../node_modules/@xnb-js/core/dist/core.module.js';
import * as Readers from '../node_modules/@xnb-js/readers/dist/readers.module.js';

setReaders(Readers);

const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return buf => { let c = -1; for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ -1) >>> 0; };
})();

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(td));
  return Buffer.concat([len, td, crc]);
}

function toPng(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = process.argv[2];
for (const file of process.argv.slice(3)) {
  const buf = fs.readFileSync(file);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const data = bufferToXnb(ab);
  const ex = data.content && data.content.export;
  if (!ex || !ex.data || !ex.width) { console.error('skip', path.basename(file), 'no texture'); continue; }
  const out = path.join(outDir, path.basename(file, '.xnb') + '.png');
  fs.writeFileSync(out, toPng(ex.width, ex.height, ex.data));
  console.log(path.basename(file), '->', ex.width + 'x' + ex.height, out);
}
