/**
 * GitHub issue 抓取与解析 —— 观天栏目数据源
 *
 * 约定（issue → 博客收录）：
 *   issue 标题 = 博客名
 *   issue 正文中第一个 http(s) 链接 = 博客地址
 *   介绍 = 正文去除链接行后的文字（截断 200 字）
 *
 * 筛选规则：
 *   1. 优先取带「观天」label 的 open issue
 *   2. 若仓库尚无该 label，则解析全部 open issue 中正文含 URL 的
 *
 * 环境变量：
 *   GITHUB_REPO   默认 nillikechatchat/aoyinai
 *   GITHUB_TOKEN  可选，提高 API 限额（匿名 60 次/时，认证 5000 次/时）
 */

const DEFAULT_REPO = "nillikechatchat/aoyinai";
const UA = "aoyinai-sky-sync/1.0 (+https://aoyinai.com)";

export interface ParsedIssueBlog {
  issueNumber: number;
  title: string;
  url: string;
  description: string;
  author: string;
  avatar: string;
}

interface GhIssue {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  user?: { login?: string; avatar_url?: string };
  labels?: Array<{ name?: string }>;
  pull_request?: unknown;
}

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": UA,
    Accept: "application/vnd.github+json",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/** 从 issue 正文提取第一个 http(s) 链接（跳过代码块与引用图标） */
function extractFirstUrl(body: string): string | null {
  const cleaned = body
    .replace(/```[\s\S]*?```/g, " ") // 去代码块
    .replace(/`[^`]*`/g, " "); // 去行内代码
  const m = cleaned.match(/https?:\/\/[^\s<>()"'\]」』】]+/);
  if (!m) return null;
  // 去尾部标点
  return m[0].replace(/[.,;:!?，。；：！？]+$/, "");
}

/** 正文清洗为介绍文字：去链接、去 markdown 符号、压缩空白 */
function extractDescription(body: string, url: string): string {
  let t = body;
  t = t
    .replace(/```[\s\S]*?```/g, " ")
    .replace(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // [text](x) → text
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/[*_>~`|]/g, "")
    .replace(/https?:\/\/\S+/g, " ");
  // 按行取非空段落
  const lines = t
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 3 && !/^[-–—=*_·•]+\d*$/.test(l));
  return lines
    .join(" · ")
    .replace(/博客地址\s*[:：]/g, "")
    .replace(/介绍\s*[:：]/g, "")
    .replace(/^[\s·]+|[\s·]+$/g, "")
    .slice(0, 200)
    .trim();
}

/** 抓取仓库 open issues（最多 60 条） */
async function fetchIssues(repo: string): Promise<GhIssue[]> {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/issues?state=open&per_page=60&sort=created&direction=desc`,
    { headers: ghHeaders(), signal: AbortSignal.timeout(15_000) }
  );
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${(await res.text()).slice(0, 120)}`);
  }
  return (await res.json()) as GhIssue[];
}

/** 解析 issue 列表为博客收录（优先「观天」label） */
export function parseIssueBlogs(issues: GhIssue[]): ParsedIssueBlog[] {
  const out: ParsedIssueBlog[] = [];
  const seen = new Set<number>();
  for (const it of issues) {
    if (it.pull_request) continue; // 跳过 PR
    const body = (it.body || "").trim();
    const url = extractFirstUrl(body);
    if (!url || !/^https?:\/\//.test(url)) continue;
    const labeled = (it.labels || []).some((l) => (l.name || "").includes("观天"));
    // 标题清洗：去掉「博客名：」等模板前缀
    const cleanTitle = it.title.trim().replace(/^(博客名|博客|blog name)\s*[:：]\s*/i, "");
    out.push({
      issueNumber: it.number,
      title: (cleanTitle || url).slice(0, 80),
      url,
      description: extractDescription(body, url),
      author: it.user?.login || "",
      avatar: it.user?.avatar_url || "",
    });
    seen.add(it.number);
    if (labeled) continue;
  }
  // 若存在带「观天」label 的 issue，则只保留带 label 的；否则全部保留
  const labeledAny = issues.some((it) =>
    (it.labels || []).some((l) => (l.name || "").includes("观天"))
  );
  if (labeledAny) {
    return out.filter((b) => {
      const src = issues.find((it) => it.number === b.issueNumber);
      return src ? (src.labels || []).some((l) => (l.name || "").includes("观天")) : false;
    });
  }
  return out;
}

/** 同步入口：拉取并解析 issue */
export async function fetchIssueBlogs(): Promise<{ repo: string; blogs: ParsedIssueBlog[] }> {
  const repo = process.env.GITHUB_REPO?.trim() || DEFAULT_REPO;
  const issues = await fetchIssues(repo);
  return { repo, blogs: parseIssueBlogs(issues) };
}

/** 「收录我的博客」入口链接（预填 issue 模板） */
export function newIssueUrl(): string {
  const repo = process.env.GITHUB_REPO?.trim() || DEFAULT_REPO;
  const title = encodeURIComponent("博客名：你的博客标题");
  const body = encodeURIComponent(
    "博客地址：https://your-blog.example.com\n介绍：用一两句话介绍你的博客，让同好一眼看懂。"
  );
  return `https://github.com/${repo}/issues/new?title=${title}&body=${body}`;
}
