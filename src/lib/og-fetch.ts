/**
 * 博客 OG 预览抓取 —— 观天卡片自动预览图
 * 抓取博客首页 HTML，解析 og:image / og:title / og:description（twitter:* 兜底）
 * 超时 8s，失败返回空串（前端用水墨兜底图）
 */

const UA = "Mozilla/5.0 (compatible; AoyinBot/1.0; +https://aoyinai.com) AppleWebKit/537.36";

export interface OgPreview {
  image: string;
  title: string;
  description: string;
}

function metaContent(html: string, keys: string[]): string {
  for (const key of keys) {
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`, "i"),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) return m[1].trim();
    }
  }
  return "";
}

function absoluteUrl(src: string, base: string): string {
  try {
    return new URL(src, base).toString();
  } catch {
    return "";
  }
}

export async function fetchOgPreview(url: string): Promise<OgPreview> {
  const empty: OgPreview = { image: "", title: "", description: "" };
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(8_000),
      redirect: "follow",
    });
    if (!res.ok) return empty;
    const type = res.headers.get("content-type") || "";
    if (!type.includes("html")) return empty;
    // 只读前 300KB 足够拿到 <head> meta 与首图
    const reader = res.body?.getReader();
    let html = "";
    if (reader) {
      const dec = new TextDecoder();
      let bytes = 0;
      while (bytes < 300_000) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        html += dec.decode(value, { stream: true });
        if (html.includes("</head>") && /<img\s/i.test(html)) break;
      }
      reader.cancel().catch(() => {});
    } else {
      html = (await res.text()).slice(0, 300_000);
    }
    const head = html.split("</head>")[0] || html;

    // 预览图三级：og:image / twitter:image → 页面首张内容图（过滤 logo/图标类）
    let image =
      metaContent(head, ["og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"]) ||
      firstContentImage(html);
    if (image) image = absoluteUrl(image, url);
    const title = metaContent(head, ["og:title", "twitter:title"]).slice(0, 120);
    const description = metaContent(head, ["og:description", "description", "twitter:description"]).slice(0, 200);
    return { image, title, description };
  } catch {
    return empty;
  }
}

/** 页面第一张内容图（过滤 logo/icon/avatar/sprite/像素追踪图等） */
function firstContentImage(html: string): string {
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const src = m[1];
    if (!/^https?:\/\//.test(src)) continue;
    if (/\.(gif|svg)(\?|$)/i.test(src)) continue; // 动图/矢量小图标
    if (/(logo|icon|avatar|sprite|badge|emoji|pixel|1x1|blank|loading)/i.test(src)) continue;
    if (/\b(width|height)=["'](?:[1-9]|[1-9]\d|1\d\d)["']/.test(m[0])) continue; // 小于 200px 的图
    return src;
  }
  return "";
}
