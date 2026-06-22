import sharp from 'sharp';
import path from 'path';

const [, , inputArg, outputArg] = process.argv;
const input = path.resolve(inputArg);
const output = path.resolve(outputArg ?? input);
const threshold = Number(process.env.TRIM_THRESHOLD ?? 28);

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const pixels = Uint8Array.from(data);

for (let i = 0; i < pixels.length; i += channels) {
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];
  if (r <= threshold && g <= threshold && b <= threshold) {
    pixels[i + 3] = 0;
  }
}

let minX = width;
let minY = height;
let maxX = 0;
let maxY = 0;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const alpha = pixels[(y * width + x) * channels + 3];
    if (alpha > 0) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

if (maxX < minX || maxY < minY) {
  throw new Error(`No visible pixels found in ${input}`);
}

const pad = Number(process.env.TRIM_PAD ?? 4);
const left = Math.max(0, minX - pad);
const top = Math.max(0, minY - pad);
const cropWidth = Math.min(width - left, maxX - minX + 1 + pad * 2);
const cropHeight = Math.min(height - top, maxY - minY + 1 + pad * 2);

await sharp(pixels, { raw: { width, height, channels } })
  .extract({ left, top, width: cropWidth, height: cropHeight })
  .png()
  .toFile(output);

console.log(`Trimmed ${path.basename(input)}: ${width}x${height} -> ${cropWidth}x${cropHeight}`);
