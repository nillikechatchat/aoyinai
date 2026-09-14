/**
 * 司南图片处理 v3：白底转透明 alpha
 * 对接近白色的低饱和像素做 alpha 抠图，得到可直接叠加的透明 PNG
 */
import sharp from "sharp";

const src = "public/images/artifact-sinan.png";
const dst = "public/images/artifact-sinan.png";

// 1) 读取当前已处理（v2: 已提亮裁剪）的图片
const base = await sharp(src)
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: W, height: H, channels: C } = base.info;
const out = Buffer.alloc(W * H * 4);

for (let i = 0; i < W * H; i++) {
  const r = base.data[i * C];
  const g = base.data[i * C + 1];
  const b = base.data[i * C + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max - min;

  let alpha = 255;
  if (sat < 14 && max >= 232) {
    // 低饱和且接近白色 -> 透明（灰度渐变区做柔和过渡）
    alpha = Math.round(Math.max(0, (255 - max) * (255 / 23)) * 0.9);
    if (max >= 252) alpha = 0;
  }
  out[i * 4] = r;
  out[i * 4 + 1] = g;
  out[i * 4 + 2] = b;
  out[i * 4 + 3] = alpha;
}

await sharp(out, { raw: { width: W, height: H, channels: 4 } })
  .resize(480, 450) // 显示尺寸约 208px，2x 足够
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toFile(dst);

// 2) 验证
const check = await sharp(dst).raw().toBuffer({ resolveWithObject: true });
const px = (x: number, y: number) => {
  const i = (y * check.info.width + x) * 4;
  return [check.data[i], check.data[i + 1], check.data[i + 2], check.data[i + 3]];
};
console.log("左上:", px(2, 2), "中心:", px(Math.floor(W / 2), Math.floor(H / 2)), "右下:", px(W - 3, H - 3));
console.log("处理完成 ✅", W, "x", H);
