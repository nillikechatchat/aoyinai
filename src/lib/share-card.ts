/**
 * 签文分享卡：用 Canvas 将一支签绘制成水墨风卡片并下载
 * 设计基准：洒金宣纸底、朱砂双线框、楷体卦名、签文引文框、宜字松绿印章条、左下二维码
 */

import QRCode from "qrcode";

export interface ShareCardData {
  name: string; // 卦名，如「潜渊卦」
  oracle: string; // 卦辞
  interpret: string; // 解曰
  advice?: string; // 宜
  question?: string; // 所问
  createdAt?: string; // ISO 日期
}

const FONT_KAI = '"Kaiti SC","STKaiti","KaiTi","DFKai-SB","TW-Kai","Noto Serif SC","Songti SC",serif';
const FONT_SONG = '"Noto Serif SC","Songti SC","STSong","SimSun","Times New Roman",serif';

const C = {
  paper: "#f6f1e5",
  paperDeep: "#efe8d6",
  ink: "#332e26",
  inkSoft: "#6f6553",
  inkFaint: "#a39a86",
  vermillion: "#a63c2a",
  gilt: "#b28a3c",
  pine: "#41573f",
  frame: "#ddd2b8",
};

/** 在限定宽度内逐字换行（中文友好） */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const ch of text) {
    if (ch === "\n") {
      lines.push(line);
      line = "";
      continue;
    }
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** 绘制宣纸底：纸色渐变 + 噪点 + 四周晕影 */
function drawPaper(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#faf6ea");
  grad.addColorStop(0.5, C.paper);
  grad.addColorStop(1, C.paperDeep);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 洒金（随机金点）
  ctx.save();
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 1.6 + 0.4;
    ctx.globalAlpha = Math.random() * 0.12 + 0.03;
    ctx.fillStyle = C.gilt;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 四周晕影
  const vign = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.75);
  vign.addColorStop(0, "rgba(120,90,40,0)");
  vign.addColorStop(1, "rgba(120,90,40,0.14)");
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, w, h);
}

/** 朱砂双线框 + 四角印章饰角 */
function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const m1 = 28;
  const m2 = 40;
  ctx.strokeStyle = C.vermillion;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 3;
  ctx.strokeRect(m1, m1, w - m1 * 2, h - m1 * 2);
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1;
  ctx.strokeRect(m2, m2, w - m2 * 2, h - m2 * 2);
  ctx.globalAlpha = 1;

  // 四角小方印
  const s = 10;
  ctx.fillStyle = C.vermillion;
  const corners: Array<[number, number]> = [
    [m2 - 5, m2 - 5],
    [w - m2 - 5, m2 - 5],
    [m2 - 5, h - m2 - 5],
    [w - m2 - 5, h - m2 - 5],
  ];
  for (const [x, y] of corners) ctx.fillRect(x - s / 2, y - s / 2, s, s);
}

function drawSeal(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  size: number,
  fontSize: number
) {
  ctx.save();
  ctx.fillStyle = C.vermillion;
  roundRect(ctx, cx - size / 2, cy - size / 2, size, size, 4);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, cx - size / 2 + 2, cy - size / 2 + 2, size - 4, size - 4, 3);
  ctx.stroke();
  ctx.fillStyle = "#f8f3e7";
  ctx.font = `${fontSize}px ${FONT_KAI}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, cy + 1);
  ctx.restore();
}

/** 生成站点二维码 DataURL（墨色、透明底） */
async function makeQrDataUrl(url: string): Promise<string | null> {
  try {
    return await QRCode.toDataURL(url, {
      margin: 0,
      width: 240,
      errorCorrectionLevel: "M",
      color: { dark: "#4a4437", light: "#00000000" },
    });
  } catch {
    return null;
  }
}

/** 拓印结果：shared=系统分享已递出 / downloaded=已存入下载 / aborted=用户取消 */
export type StampResult = "shared" | "downloaded" | "aborted";

/**
 * 生成签文分享卡并导出。
 * 移动端优先尝试系统分享（Web Share API Level 2），失败或无能力则回退下载。
 */
export async function downloadInsightCard(data: ShareCardData): Promise<StampResult> {
  const W = 750;
  const H = 1050;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrDataUrl = siteUrl ? await makeQrDataUrl(siteUrl) : null;

  drawPaper(ctx, W, H);
  drawFrame(ctx, W, H);

  const contentW = W - 160;

  // ---- 顶部小字 ----
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = C.inkFaint;
  ctx.font = `24px ${FONT_SONG}`;
  ctx.fillText("敖 胤 先 生 · 赐 签", W / 2, 118);

  // 分隔短线
  ctx.strokeStyle = C.frame;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 70, 140);
  ctx.lineTo(W / 2 + 70, 140);
  ctx.stroke();

  // ---- 卦名 + 印 ----
  ctx.fillStyle = C.vermillion;
  ctx.font = `bold 78px ${FONT_KAI}`;
  ctx.textAlign = "center";
  ctx.fillText(data.name, W / 2 - 22, 236);
  drawSeal(ctx, data.name.replace("卦", "").slice(-1) || "签", W / 2 + 150, 208, 56, 26);

  // ---- 卦辞引文框 ----
  ctx.font = `30px ${FONT_KAI}`;
  const oracleLines = wrapText(ctx, `「${data.oracle}」`, contentW - 60);
  const boxH = oracleLines.length * 50 + 44;
  const boxY = 292;
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  roundRect(ctx, 80, boxY, W - 160, boxH, 6);
  ctx.fill();
  ctx.strokeStyle = C.frame;
  ctx.lineWidth = 1.5;
  roundRect(ctx, 80, boxY, W - 160, boxH, 6);
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.textAlign = "center";
  oracleLines.forEach((ln, i) => {
    ctx.fillText(ln, W / 2, boxY + 52 + i * 50);
  });

  // ---- 解曰 ----
  let y = boxY + boxH + 66;
  ctx.fillStyle = C.gilt;
  ctx.font = `26px ${FONT_KAI}`;
  ctx.textAlign = "left";
  ctx.fillText("解 曰", 84, y);

  y += 44;
  ctx.fillStyle = C.inkSoft;
  ctx.font = `26px ${FONT_SONG}`;
  const interpLines = wrapText(ctx, data.interpret, contentW);
  const maxInterp = 6;
  interpLines.slice(0, maxInterp).forEach((ln, i) => {
    ctx.fillText(ln, 84, y + i * 44);
  });
  if (interpLines.length > maxInterp) {
    ctx.fillStyle = C.inkFaint;
    ctx.fillText("……", 84, y + maxInterp * 44);
  }

  // ---- 宜 ----
  if (data.advice) {
    y += Math.min(interpLines.length, maxInterp) * 44 + 36;
    const adviceLines = wrapText(ctx, data.advice, contentW - 100);
    const aH = adviceLines.length * 40 + 36;
    ctx.fillStyle = "rgba(65,87,63,0.06)";
    roundRect(ctx, 84, y, W - 168, aH, 4);
    ctx.fill();
    ctx.fillStyle = C.pine;
    ctx.fillRect(84, y, 4, aH);
    // 宜印
    ctx.save();
    ctx.strokeStyle = C.vermillion;
    ctx.lineWidth = 2;
    roundRect(ctx, 104, y + aH / 2 - 14, 28, 28, 3);
    ctx.stroke();
    ctx.fillStyle = C.vermillion;
    ctx.font = `18px ${FONT_KAI}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("宜", 118, y + aH / 2 + 1);
    ctx.restore();

    ctx.fillStyle = C.ink;
    ctx.font = `25px ${FONT_SONG}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    adviceLines.slice(0, 3).forEach((ln, i) => {
      ctx.fillText(ln, 148, y + 40 + i * 40);
    });
    y += aH;
  }

  // ---- 所问 ----
  if (data.question) {
    y += 34;
    ctx.fillStyle = C.inkFaint;
    ctx.font = `23px ${FONT_SONG}`;
    const qLines = wrapText(ctx, `所问：${data.question}`, contentW);
    qLines.slice(0, 2).forEach((ln, i) => {
      ctx.fillText(ln, 84, y + i * 36);
    });
  }

  // ---- 底部：二维码（左） + 日期与品牌（右对齐排布） ----
  if (qrDataUrl) {
    const qrImg = new Image();
    await new Promise<void>((resolve) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = () => resolve();
      qrImg.src = qrDataUrl;
    });
    const qrSize = 100;
    const qrX = 92;
    const qrY = H - 176;
    // 衬底小卡
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    roundRect(ctx, qrX - 7, qrY - 7, qrSize + 14, qrSize + 14, 4);
    ctx.fill();
    ctx.strokeStyle = C.frame;
    ctx.lineWidth = 1;
    roundRect(ctx, qrX - 7, qrY - 7, qrSize + 14, qrSize + 14, 4);
    ctx.stroke();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    ctx.fillStyle = C.inkFaint;
    ctx.font = `17px ${FONT_SONG}`;
    ctx.textAlign = "center";
    ctx.fillText("扫码 · 再问一卦", qrX + qrSize / 2, qrY + qrSize + 18);
  }

  const dateStr = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  // 右侧落款区：日期在上、品牌在下（避开左侧二维码）
  ctx.textAlign = "left";
  ctx.fillStyle = C.inkFaint;
  ctx.font = `22px ${FONT_SONG}`;
  if (dateStr) ctx.fillText(dateStr, 252, H - 150);

  ctx.fillStyle = C.inkSoft;
  ctx.font = `26px ${FONT_KAI}`;
  ctx.fillText("敖胤AI · 观智能之潮", 252, H - 106);
  drawSeal(ctx, "胤", W - 110, H - 108, 34, 16);

  // 导出：优先系统分享，回退下载
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));

  const fileName = `敖胤AI-签文-${data.name}.png`;
  if (blob && typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      const file = new File([blob], fileName, { type: "image/png" });
      if (!navigator.canShare || navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `敖胤AI · ${data.name}`,
          text: `「${data.oracle}」—— 敖胤先生赐签`,
        });
        return "shared";
      }
    } catch (e) {
      // 用户取消分享不算失败；其他错误回退下载
      if ((e as Error)?.name === "AbortError") return "aborted";
    }
  }

  const url = blob ? URL.createObjectURL(blob) : canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (blob) URL.revokeObjectURL(url);
  return "downloaded";
}

export interface ArticleCardData {
  seal: string; // 栏目印章单字，如「教」
  categoryName: string; // 栏目名，如「AI 教程」
  title: string;
  excerpt: string;
  readMinutes: number;
  publishedAt?: string; // ISO 日期
}

export interface CalendarCardDay {
  day: number; // 1 起
  seal: string; // 当日首签卦名末字（无签为空串）
  count: number; // 当日签数
}

export interface CalendarCardData {
  year: number;
  month: number; // 1 起
  days: CalendarCardDay[]; // 仅含有签之日
  total: number; // 本月签数
  dayCount: number; // 本月有签日数
}

/** 月历分享卡网格几何参数 */
const CAL = {
  cell: 76, // 单元格尺寸（正方形）
  gap: 6,
};

/**
 * 生成「签历月历卡」：将某月问签之日绘成水墨月历并导出（分享优先，回退下载）
 */
export async function downloadCalendarCard(data: CalendarCardData): Promise<StampResult> {
  const W = 750;
  const H = 1050;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrDataUrl = siteUrl ? await makeQrDataUrl(siteUrl) : null;

  drawPaper(ctx, W, H);
  drawFrame(ctx, W, H);

  const firstDay = new Date(data.year, data.month - 1, 1);
  const daysInMonth = new Date(data.year, data.month, 0).getDate();
  const leading = firstDay.getDay(); // 周日=0
  const dayMap = new Map(data.days.map((d) => [d.day, d]));

  const gridW = CAL.cell * 7 + CAL.gap * 6;
  // 居中网格左缘
  const gx = (W - gridW) / 2;
  const headerY = 300; // 星期行
  const rowH = CAL.cell + CAL.gap;
  const rows = Math.ceil((leading + daysInMonth) / 7);
  const gridBottom = headerY + 34 + rows * rowH;

  // ---- 顶部小字 ----
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = C.inkFaint;
  ctx.font = `24px ${FONT_SONG}`;
  ctx.fillText("敖 胤 先 生 · 签 历", W / 2, 112);

  ctx.strokeStyle = C.frame;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 70, 134);
  ctx.lineTo(W / 2 + 70, 134);
  ctx.stroke();

  // ---- 年月大字 + 印 ----
  ctx.fillStyle = C.ink;
  ctx.font = `bold 62px ${FONT_KAI}`;
  ctx.fillText(`${data.year} 年 ${data.month} 月`, W / 2 - 20, 218);
  drawSeal(ctx, "历", W / 2 + 172, 196, 50, 23);

  // ---- 统计行 ----
  ctx.fillStyle = C.gilt;
  ctx.font = `25px ${FONT_KAI}`;
  ctx.fillText(
    data.total > 0
      ? `本月 ${data.total} 签 · ${data.dayCount} 个朱印之日`
      : "本月尚无问签 · 静待落笔",
    W / 2,
    262
  );

  // ---- 星期表头 ----
  ctx.font = `22px ${FONT_KAI}`;
  ctx.fillStyle = C.inkFaint;
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  weekdays.forEach((w, i) => {
    ctx.fillText(w, gx + i * (CAL.cell + CAL.gap) + CAL.cell / 2, headerY);
  });

  // ---- 日期网格 ----
  for (let i = 0; i < daysInMonth; i++) {
    const day = i + 1;
    const col = (leading + i) % 7;
    const row = Math.floor((leading + i) / 7);
    const cx = gx + col * (CAL.cell + CAL.gap);
    const cy = headerY + 34 + row * rowH;
    const info = dayMap.get(day);

    if (info) {
      // 朱印之日：朱底圆角块 + 卦名末字
      ctx.fillStyle = C.vermillion;
      roundRect(ctx, cx, cy, CAL.cell, CAL.cell, 8);
      ctx.fill();
      // 内衬白线
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, cx + 4, cy + 4, CAL.cell - 8, CAL.cell - 8, 6);
      ctx.stroke();

      ctx.fillStyle = "#f8f3e7";
      ctx.font = `30px ${FONT_KAI}`;
      ctx.textAlign = "center";
      ctx.fillText(String(day), cx + CAL.cell / 2, cy + 40);

      // 卦名末字小章（白描）
      ctx.strokeStyle = "rgba(248,243,231,0.75)";
      ctx.lineWidth = 1.2;
      roundRect(ctx, cx + CAL.cell / 2 - 11, cy + 50, 22, 22, 3);
      ctx.stroke();
      ctx.fillStyle = "#f8f3e7";
      ctx.font = `15px ${FONT_KAI}`;
      ctx.textBaseline = "middle";
      ctx.fillText(info.seal || "签", cx + CAL.cell / 2, cy + 62);
      ctx.textBaseline = "alphabetic";

      // 多签角标
      if (info.count > 1) {
        ctx.fillStyle = C.gilt;
        ctx.beginPath();
        ctx.arc(cx + CAL.cell - 6, cy + 6, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f8f3e7";
        ctx.font = `13px ${FONT_SONG}`;
        ctx.textBaseline = "middle";
        ctx.fillText(String(info.count), cx + CAL.cell - 6, cy + 7.5);
        ctx.textBaseline = "alphabetic";
      }
    } else {
      // 素日
      ctx.fillStyle = C.inkFaint;
      ctx.font = `24px ${FONT_SONG}`;
      ctx.textAlign = "center";
      ctx.globalAlpha = 0.55;
      ctx.fillText(String(day), cx + CAL.cell / 2, cy + 42);
      ctx.globalAlpha = 1;
      // 虚线框
      ctx.strokeStyle = C.frame;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      roundRect(ctx, cx + 2, cy + 2, CAL.cell - 4, CAL.cell - 4, 6);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // ---- 底部题记 + 二维码 ----
  const footY = Math.min(gridBottom + 60, H - 190);

  if (qrDataUrl) {
    const qrImg = new Image();
    await new Promise<void>((resolve) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = () => resolve();
      qrImg.src = qrDataUrl;
    });
    const qrSize = 100;
    const qrX = 92;
    const qrY = H - 176;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    roundRect(ctx, qrX - 7, qrY - 7, qrSize + 14, qrSize + 14, 4);
    ctx.fill();
    ctx.strokeStyle = C.frame;
    ctx.lineWidth = 1;
    roundRect(ctx, qrX - 7, qrY - 7, qrSize + 14, qrSize + 14, 4);
    ctx.stroke();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    ctx.fillStyle = C.inkFaint;
    ctx.font = `17px ${FONT_SONG}`;
    ctx.textAlign = "center";
    ctx.fillText("扫码 · 再问一卦", qrX + qrSize / 2, qrY + qrSize + 18);
  }

  // 题记（居中于网格下方）
  ctx.textAlign = "center";
  ctx.fillStyle = C.inkSoft;
  ctx.font = `24px ${FONT_KAI}`;
  ctx.fillText("朱印之日 · 皆有叩问", W / 2, footY);
  ctx.fillStyle = C.inkFaint;
  ctx.font = `20px ${FONT_SONG}`;
  ctx.fillText("一念一签 · 皆有回响", W / 2, footY + 38);

  ctx.textAlign = "left";
  ctx.fillStyle = C.inkSoft;
  ctx.font = `26px ${FONT_KAI}`;
  ctx.fillText("敖胤AI · 观智能之潮", 252, H - 106);
  drawSeal(ctx, "胤", W - 110, H - 108, 34, 16);

  // 导出：优先系统分享，回退下载
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  const fileName = `敖胤AI-签历-${data.year}年${data.month}月.png`;

  if (blob && typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      const file = new File([blob], fileName, { type: "image/png" });
      if (!navigator.canShare || navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `敖胤AI · ${data.year} 年 ${data.month} 月签历`,
          text: `${data.year} 年 ${data.month} 月，凡 ${data.total} 问，录于签历。`,
        });
        return "shared";
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return "aborted";
    }
  }

  const url = blob ? URL.createObjectURL(blob) : canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (blob) URL.revokeObjectURL(url);
  return "downloaded";
}

/**
 * 生成「荐书签」：将一篇文章绘制成水墨荐书卡并导出（分享优先，回退下载）
 */
export async function downloadArticleCard(data: ArticleCardData): Promise<StampResult> {
  const W = 750;
  const H = 1050;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrDataUrl = siteUrl ? await makeQrDataUrl(siteUrl) : null;

  drawPaper(ctx, W, H);
  drawFrame(ctx, W, H);

  const contentW = W - 160;

  // ---- 顶部小字 ----
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = C.inkFaint;
  ctx.font = `24px ${FONT_SONG}`;
  ctx.fillText("敖 胤 先 生 · 荐", W / 2, 118);

  ctx.strokeStyle = C.frame;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 70, 140);
  ctx.lineTo(W / 2 + 70, 140);
  ctx.stroke();

  // ---- 栏目印 + 栏目名 ----
  drawSeal(ctx, data.seal || "文", W / 2, 212, 64, 28);
  ctx.fillStyle = C.inkSoft;
  ctx.font = `24px ${FONT_SONG}`;
  ctx.fillText(`据（${data.categoryName}）一卷`, W / 2, 282);

  // ---- 题名（大楷，最多三行） ----
  ctx.fillStyle = C.ink;
  ctx.font = `bold 52px ${FONT_KAI}`;
  const titleLines = wrapText(ctx, data.title, contentW).slice(0, 3);
  titleLines.forEach((ln, i) => {
    ctx.fillText(ln, W / 2, 372 + i * 72);
  });

  // 题名下的鎏金短线
  const lineY = 372 + titleLines.length * 72 - 30;
  ctx.strokeStyle = C.gilt;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 54, lineY);
  ctx.lineTo(W / 2 + 54, lineY);
  ctx.stroke();

  // ---- 摘要（引文框，最多五行） ----
  const excerptY = lineY + 56;
  ctx.font = `26px ${FONT_SONG}`;
  const exLines = wrapText(ctx, data.excerpt, contentW - 56).slice(0, 5);
  const exBoxH = exLines.length * 44 + 40;
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  roundRect(ctx, 80, excerptY, W - 160, exBoxH, 6);
  ctx.fill();
  ctx.strokeStyle = C.frame;
  ctx.lineWidth = 1.5;
  roundRect(ctx, 80, excerptY, W - 160, exBoxH, 6);
  ctx.stroke();
  ctx.fillStyle = C.inkSoft;
  ctx.textAlign = "left";
  exLines.forEach((ln, i) => {
    ctx.fillText(ln, 108, excerptY + 44 + i * 44);
  });
  if (wrapText(ctx, data.excerpt, contentW - 56).length > 5) {
    ctx.fillStyle = C.inkFaint;
    ctx.fillText("……", 108, excerptY + 44 + 5 * 44);
  }

  // ---- 阅读时长 ----
  const metaY = excerptY + exBoxH + 64;
  ctx.fillStyle = C.gilt;
  ctx.font = `26px ${FONT_KAI}`;
  ctx.textAlign = "center";
  ctx.fillText(`◈ 展卷约 ${data.readMinutes} 分钟 ◈`, W / 2, metaY);

  // ---- 底部：二维码（左） + 日期与品牌（右） ----
  if (qrDataUrl) {
    const qrImg = new Image();
    await new Promise<void>((resolve) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = () => resolve();
      qrImg.src = qrDataUrl;
    });
    const qrSize = 100;
    const qrX = 92;
    const qrY = H - 176;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    roundRect(ctx, qrX - 7, qrY - 7, qrSize + 14, qrSize + 14, 4);
    ctx.fill();
    ctx.strokeStyle = C.frame;
    ctx.lineWidth = 1;
    roundRect(ctx, qrX - 7, qrY - 7, qrSize + 14, qrSize + 14, 4);
    ctx.stroke();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    ctx.fillStyle = C.inkFaint;
    ctx.font = `17px ${FONT_SONG}`;
    ctx.textAlign = "center";
    ctx.fillText("扫码 · 展卷共读", qrX + qrSize / 2, qrY + qrSize + 18);
  }

  const dateStr = data.publishedAt
    ? new Date(data.publishedAt).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  ctx.textAlign = "left";
  ctx.fillStyle = C.inkFaint;
  ctx.font = `22px ${FONT_SONG}`;
  if (dateStr) ctx.fillText(`刊于 ${dateStr}`, 252, H - 150);

  ctx.fillStyle = C.inkSoft;
  ctx.font = `26px ${FONT_KAI}`;
  ctx.fillText("敖胤AI · 观智能之潮", 252, H - 106);
  drawSeal(ctx, "胤", W - 110, H - 108, 34, 16);

  // 导出：优先系统分享，回退下载
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  const fileName = `敖胤AI-荐书签-${data.title.slice(0, 12)}.png`;

  if (blob && typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      const file = new File([blob], fileName, { type: "image/png" });
      if (!navigator.canShare || navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `荐一文 · ${data.title}`,
          text: data.excerpt.slice(0, 80),
        });
        return "shared";
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return "aborted";
    }
  }

  const url = blob ? URL.createObjectURL(blob) : canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (blob) URL.revokeObjectURL(url);
  return "downloaded";
}
