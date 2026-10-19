// p5.brush 2.2.3 creates a new upload canvas for almost every fill size.
// Upload mask alpha through pixels, avoiding transient staging-canvas textures.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageRoot = resolve(root, 'node_modules/p5.brush');
const pkg = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));
if (pkg.version !== '2.2.3') {
  throw new Error(`Unsupported p5.brush ${pkg.version}; review upload-canvas patch before updating it`);
}

const originalCanvas = `  if (
    !FillMaskUploadCanvas ||
    FillMaskUploadCanvas.width !== uploadWidth ||
    FillMaskUploadCanvas.height !== uploadHeight
  ) {
    FillMaskUploadCanvas = create2DCanvas(uploadWidth, uploadHeight);
  }`;
const reusedCanvas = `  // Reuse the canvas; resizing releases the previous backing store.
  if (!FillMaskUploadCanvas) {
    FillMaskUploadCanvas = create2DCanvas(uploadWidth, uploadHeight);
  }
  if (FillMaskUploadCanvas.width !== uploadWidth) {
    FillMaskUploadCanvas.width = uploadWidth;
  }
  if (FillMaskUploadCanvas.height !== uploadHeight) {
    FillMaskUploadCanvas.height = uploadHeight;
  }`;
const canvasUpload = `

  const uploadContext = FillMaskUploadCanvas.drawingContext;
  uploadContext.clearRect(0, 0, uploadWidth, uploadHeight);
  uploadContext.drawImage(
    mask,
    uploadRect.minX,
    uploadRect.minY,
    uploadWidth,
    uploadHeight,
    0,
    0,
    uploadWidth,
    uploadHeight,
  );

  clearTarget(target);
  gl.bindTexture(gl.TEXTURE_2D, target.colorTexture);
  gl.texSubImage2D(
    gl.TEXTURE_2D,
    0,
    uploadRect.minX,
    uploadRect.minY,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    FillMaskUploadCanvas,
  );`;
const originalDistCanvas = 'Kr&&Kr.width===c&&Kr.height===l||(Kr=st(c,l));';
const reusedDistCanvas = 'Kr||(Kr=st(c,l));Kr.width!==c&&(Kr.width=c);Kr.height!==l&&(Kr.height=l);';
const distCanvasUpload = 'const h=Kr.drawingContext;return h.clearRect(0,0,c,l),h.drawImage(e,a.minX,a.minY,c,l,0,0,c,l),i(o),s.bindTexture(s.TEXTURE_2D,o.colorTexture),s.texSubImage2D(s.TEXTURE_2D,0,a.minX,a.minY,s.RGBA,s.UNSIGNED_BYTE,Kr),o';
const edits = [
  {
    file: 'src/fill/composite.js',
    before: ['Renderer.mask = create2DCanvas(maskWidth, maskHeight);'],
    after: 'Renderer.mask = create2DCanvas(maskWidth, maskHeight, true);',
  },
  {
    file: 'dist/p5.brush.js',
    before: ['t.mask=st(o,s)'],
    after: 't.mask=st(o,s,!0)',
  },
  {
    file: 'src/fill/composite.js',
    before: [originalCanvas + canvasUpload, reusedCanvas + canvasUpload],
    after: `  // Only alpha is sampled by the blend shader. getImageData preserves it
  // without allocating a differently-sized GPU staging canvas for every shape.
  const pixels = mask.drawingContext.getImageData(
    uploadRect.minX, uploadRect.minY, uploadWidth, uploadHeight,
  ).data;
  clearTarget(target);
  gl.bindTexture(gl.TEXTURE_2D, target.colorTexture);
  const flipY = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
  const premultiply = gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  try {
    gl.texSubImage2D(
      gl.TEXTURE_2D, 0, uploadRect.minX, uploadRect.minY,
      uploadWidth, uploadHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels,
    );
  } finally {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiply);
  }`,
  },
  {
    file: 'dist/p5.brush.js',
    before: [originalDistCanvas + distCanvasUpload, reusedDistCanvas + distCanvasUpload],
    after: 'const h=e.drawingContext.getImageData(a.minX,a.minY,c,l).data;i(o);s.bindTexture(s.TEXTURE_2D,o.colorTexture);const u=s.getParameter(s.UNPACK_FLIP_Y_WEBGL),f=s.getParameter(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL);s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1);s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1);try{s.texSubImage2D(s.TEXTURE_2D,0,a.minX,a.minY,c,l,s.RGBA,s.UNSIGNED_BYTE,h)}finally{s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,u);s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,f)}return o',
  },
];

const count = (text, needle) => text.split(needle).length - 1;
// Validate every target before writing either, including an already-patched install.
const prepared = edits.reduce((items, edit) => {
  const path = resolve(packageRoot, edit.file);
  const prior = items.find(item => item.path === path);
  const original = prior?.updated ?? readFileSync(path, 'utf8');
  const normalized = original.replace(/\r\n/g, '\n');
  const matches = edit.before.map(before => ({ before, count: count(normalized, before) }));
  const beforeCount = matches.reduce((sum, match) => sum + match.count, 0);
  const afterCount = count(normalized, edit.after);
  if (beforeCount === 0 && afterCount === 1) {
    if (!prior) items.push({ path, file: edit.file, updated: null });
    return items;
  }
  if (beforeCount !== 1 || afterCount !== 0) {
    throw new Error(`p5.brush patch mismatch in ${edit.file}: expected one original or one patched snippet; found ${beforeCount} original and ${afterCount} patched`);
  }
  const patched = normalized.replace(matches.find(match => match.count === 1).before, edit.after);
  const updated = original.includes('\r\n') ? patched.replace(/\n/g, '\r\n') : patched;
  if (prior) prior.updated = updated;
  else items.push({ path, file: edit.file, updated });
  return items;
}, []);
for (const item of prepared) {
  if (item.updated !== null) writeFileSync(item.path, item.updated, 'utf8');
  console.log(`p5.brush resource patch: ${item.file} ${item.updated === null ? 'already applied' : 'applied'}`);
}
