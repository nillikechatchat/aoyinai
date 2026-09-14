"use client";

import { useEffect, useRef, useState } from "react";
import { CornerDownRight, Feather, Loader2, MessageCircle, PenLine, ScrollText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CommentItem {
  id: string;
  articleSlug: string;
  parentId?: string | null;
  replyToAuthor?: string | null;
  author: string;
  body: string;
  reactions: number;
  createdAt: string;
}

/** 两层结构：顶端留言 + 其下的复言（无论复言指向谁，都归入顶端祖先之下） */
interface CommentThread {
  comment: CommentItem;
  replies: CommentItem[];
}

const AUTHOR_KEY = "aoyin_comment_author";
const REACTED_KEY = "aoyin_comment_reacted"; // 已印可的留言 id 集合
const MASTER_AUTHOR = "敖胤先生"; // 站主落款，可「只看先生之言」

/** 是否已对此言印可（同感） */
function hasReacted(id: string): boolean {
  try {
    const set = new Set((localStorage.getItem(REACTED_KEY) ?? "").split(",").filter(Boolean));
    return set.has(id);
  } catch {
    return false;
  }
}

/** 记下印可痕迹 */
function markReacted(id: string) {
  try {
    const set = new Set((localStorage.getItem(REACTED_KEY) ?? "").split(",").filter(Boolean));
    set.add(id);
    localStorage.setItem(REACTED_KEY, [...set].join(","));
  } catch {
    // ignore
  }
}

/** 将扁平留言整理为两层会话树（复言一律归入顶端祖先之下，孤儿复言自动升为顶端） */
function buildThreads(flat: CommentItem[]): CommentThread[] {
  const byId = new Map(flat.map((c) => [c.id, c]));
  const rootOf = new Map<string, string>(); // id -> 顶端祖先 id

  const resolveRoot = (id: string): string => {
    if (rootOf.has(id)) return rootOf.get(id)!;
    const c = byId.get(id);
    let rootId = id;
    if (c?.parentId && byId.has(c.parentId) && c.parentId !== id) {
      rootId = resolveRoot(c.parentId);
    }
    rootOf.set(id, rootId);
    return rootId;
  };
  flat.forEach((c) => resolveRoot(c.id));

  const threads = new Map<string, CommentThread>();
  const order: string[] = [];

  const addThread = (c: CommentItem) => {
    if (!threads.has(c.id)) {
      threads.set(c.id, { comment: c, replies: [] });
      order.push(c.id);
    }
  };

  // 顶端留言：时间倒序
  flat
    .filter((c) => !c.parentId || !byId.has(c.parentId))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .forEach(addThread);

  // 复言归入顶端祖先
  for (const c of flat) {
    if (threads.has(c.id)) continue;
    const rootId = rootOf.get(c.id)!;
    if (threads.has(rootId)) {
      threads.get(rootId)!.replies.push(c);
    } else {
      // 顶端祖先缺失（被删除），自身升为顶端
      addThread(c);
    }
  }

  // 复言按时间正序（对话感）
  for (const t of threads.values()) {
    t.replies.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  }
  return order.map((id) => threads.get(id)!);
}

/**
 * 笔谈（文章匿名留言板）
 * 支持复言：点击留言右下「复」即可针对该言落笔，复言缩进归于其下
 */
export function ArticleComments({ slug }: { slug: string }) {
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [onlyMaster, setOnlyMaster] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  /** 楼层号：全篇按时间正序编楼（#1 起），存 id → 楼层 */
  const [floorMap, setFloorMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    try {
      const saved = localStorage.getItem(AUTHOR_KEY);
      if (saved) setAuthor(saved);
    } catch {
      // ignore
    }
    (async () => {
      try {
        const res = await fetch(`/api/articles/${slug}/comments`);
        const data = await res.json();
        if (!cancelled && data.ok) {
          const flat: CommentItem[] = data.comments;
          setThreads(buildThreads(flat));
          setTotalCount(flat.length);
          const chronological = [...flat].sort(
            (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
          );
          setFloorMap(new Map(chronological.map((c, i) => [c.id, i + 1])));
        }
      } catch {
        // 静默：笔谈加载失败不影响阅读
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const submit = async () => {
    const text = body.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: author.trim(),
          body: text,
          parentId: replyTo?.id ?? undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        toast({ title: "未能落笔", description: data.error ?? "请稍后再试。" });
        return;
      }
      const created: CommentItem = data.comment;
      setThreads((prev) => {
        if (created.parentId) {
          return prev.map((t) =>
            t.comment.id === created.parentId
              ? { ...t, replies: [...t.replies, created] }
              : t
          );
        }
        return [{ comment: created, replies: [] }, ...prev];
      });
      setTotalCount((n) => n + 1);
      setFloorMap((prev) => {
        const next = new Map(prev);
        next.set(created.id, next.size + 1); // 追加楼层（时序近似）
        return next;
      });
      setBody("");
      const wasReply = !!replyTo;
      setReplyTo(null);
      try {
        if (author.trim()) localStorage.setItem(AUTHOR_KEY, author.trim());
      } catch {
        // ignore
      }
      toast({
        title: wasReply ? "复言已录" : "已落笔",
        description: wasReply ? "复言已归于那纸留言之下。" : "留言已录入笔谈，与后来者共赏。",
      });
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      });
    } catch {
      toast({ title: "未能落笔", description: "网络异常，请稍后再试。" });
    } finally {
      setSubmitting(false);
    }
  };

  const beginReply = (c: CommentItem) => {
    // 归于顶端祖先之下，展示指向被复者
    setReplyTo({ id: c.parentId ?? c.id, author: c.author });
    bodyRef.current?.focus();
  };

  /** 「只看先生之言」筛选：保留含先生留言的会话（上下文完整） */
  const visibleThreads = onlyMaster
    ? threads.filter(
        (t) =>
          t.comment.author === MASTER_AUTHOR ||
          t.replies.some((r) => r.author === MASTER_AUTHOR)
      )
    : threads;

  return (
    <section className="mt-9" aria-label="笔谈留言板">
      <div className="flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 font-kai text-base tracking-[0.25em] text-ink">
          <ScrollText className="h-4 w-4 text-gilt" aria-hidden />
          笔谈
          {!loading && (
            <span className="font-song text-xs tracking-normal text-ink-faint">
              （{totalCount}）
            </span>
          )}
        </h3>
        {/* 只看先生之言 */}
        <button
          onClick={() => setOnlyMaster((v) => !v)}
          aria-pressed={onlyMaster}
          title={onlyMaster ? "正在只看敖胤先生的留言" : "只看敖胤先生的留言"}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 font-kai text-[0.68rem] tracking-[0.15em] transition-colors",
            onlyMaster
              ? "border-gilt bg-gilt/15 text-gilt"
              : "border-frame bg-paper-card text-ink-faint hover:border-gilt/50 hover:text-gilt"
          )}
        >
          <Feather className="h-3 w-3" aria-hidden />
          只看先生
        </button>
      </div>

      <div className="ink-divider mt-3" />

      {/* 留言列表 */}
      <div
        ref={listRef}
        className="custom-scrollbar mt-4 max-h-80 space-y-3 overflow-y-auto pr-1"
      >
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-ink-faint">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <span className="font-song text-xs tracking-[0.2em]">翻阅笔谈中…</span>
          </div>
        ) : visibleThreads.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="seal-outline h-9 w-9 text-[0.72rem]">谈</span>
            <p className="font-kai text-sm tracking-[0.25em] text-ink-soft">
              {onlyMaster ? "先生尚未于此留言" : "笔谈尚无留痕"}
            </p>
            <p className="font-song text-xs text-ink-faint">
              {onlyMaster ? "他日机缘至时，自有批注" : "读罢此文，若有会心处，欢迎落笔一二"}
            </p>
          </div>
        ) : (
          visibleThreads.map((t, i) => (
            <div
              key={t.comment.id}
              style={{
                animation: `fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) ${Math.min(i * 0.04, 0.3)}s both`,
              }}
            >
              {/* 顶端留言 */}
              <CommentRow
                c={t.comment}
                slug={slug}
                floor={floorMap.get(t.comment.id)}
                onReply={beginReply}
                replying={replyTo?.id === t.comment.id && replyTo?.author === t.comment.author}
              />
              {/* 复言 */}
              {t.replies.length > 0 && (
                <div className="ml-6 mt-2 space-y-2 border-l-2 border-frame/70 pl-3">
                  {t.replies.map((r) => (
                    <CommentRow
                      key={r.id}
                      c={r}
                      slug={slug}
                      floor={floorMap.get(r.id)}
                      onReply={beginReply}
                      replying={replyTo?.id === (r.parentId ?? r.id) && replyTo?.author === r.author}
                      compact
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 落笔表单 */}
      <div className="mt-4 rounded-sm border border-frame/70 bg-paper-card p-3.5">
        {/* 复言指示条 */}
        {replyTo && (
          <div className="mb-2.5 flex items-center justify-between rounded-sm border border-gilt/50 bg-gilt/10 px-3 py-1.5">
            <span className="inline-flex items-center gap-1.5 font-kai text-xs tracking-[0.15em] text-ink">
              <CornerDownRight className="h-3.5 w-3.5 text-gilt" aria-hidden />
              复 <span className="text-vermillion">{replyTo.author}</span>：
            </span>
            <button
              onClick={() => setReplyTo(null)}
              className="text-ink-faint transition-colors hover:text-vermillion"
              aria-label="取消复言"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={12}
            placeholder="落款名号（可留空，记为「无名氏」）"
            className="h-9 flex-1 border-frame bg-paper font-song text-sm placeholder:text-ink-faint/70 focus-visible:ring-vermillion/40"
            aria-label="落款名号"
          />
        </div>
        <Textarea
          ref={bodyRef}
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 500))}
          rows={3}
          placeholder={replyTo ? `复 ${replyTo.author}：写下你的回应…（五百字以内）` : "写下读后所感…（五百字以内）"}
          className="custom-scrollbar mt-2 border-frame bg-paper font-song text-sm leading-6 placeholder:text-ink-faint/70 focus-visible:ring-vermillion/40"
          aria-label={replyTo ? `复 ${replyTo.author} 的留言` : "留言内容"}
        />
        <div className="mt-2.5 flex items-center justify-between">
          <span className="font-song text-[0.68rem] text-ink-faint">{body.length} / 500</span>
          <Button
            onClick={submit}
            disabled={!body.trim() || submitting}
            className="h-9 gap-2 rounded-full bg-pine px-5 font-kai text-sm tracking-[0.25em] text-[#f3efdf] shadow-sm transition-colors hover:bg-pine-deep disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : replyTo ? (
              <CornerDownRight className="h-4 w-4" aria-hidden />
            ) : (
              <PenLine className="h-4 w-4" aria-hidden />
            )}
            {replyTo ? "复言" : "落笔"}
          </Button>
        </div>
      </div>
    </section>
  );
}

/** 「有同感」印可此言：印章式按钮 + 计数，一人一言仅可印一次 */
function ReactButton({ slug, id, initial }: { slug: string; id: string; initial: number }) {
  // 笔谈列表在客户端拉取后才渲染，无 SSR 水合不一致风险
  const [reacted, setReacted] = useState(() => hasReacted(id));
  const [count, setCount] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [pulse, setPulse] = useState(false);

  const react = async () => {
    if (reacted || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/articles/${slug}/comments/${id}/react`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        markReacted(id);
        setReacted(true);
        setCount(data.reactions);
        setPulse(true);
        window.setTimeout(() => setPulse(false), 700);
      }
    } catch {
      // 静默：印可失败不影响阅读
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={react}
      disabled={reacted || busy}
      aria-pressed={reacted}
      aria-label={reacted ? "已印可此言" : "印可此言（有同感）"}
      title={reacted ? "已印可此言" : "有同感 · 印可此言"}
      className={cn(
        "mt-1.5 inline-flex h-6 items-center gap-1 rounded-full border px-2 font-song text-[0.68rem] tracking-[0.12em] transition-colors",
        reacted
          ? "border-vermillion/60 bg-vermillion/10 text-vermillion"
          : "border-frame/80 text-ink-faint hover:border-vermillion/50 hover:text-vermillion",
        pulse && "react-pulse"
      )}
    >
      <span
        className={cn(
          "inline-grid h-3.5 w-3.5 place-items-center rounded-[2px] border font-kai text-[0.55rem] leading-none",
          reacted ? "border-vermillion/70 bg-vermillion text-[#f8f3e7]" : "border-current"
        )}
        aria-hidden
      >
        同
      </span>
      同感
      {count > 0 && <span className="tabular-nums text-[0.66rem] opacity-80">{count}</span>}
    </button>
  );
}

/** 单条留言行 */
function CommentRow({
  c,
  slug,
  onReply,
  replying,
  compact,
  floor,
}: {
  c: CommentItem;
  slug: string;
  onReply: (c: CommentItem) => void;
  replying?: boolean;
  compact?: boolean;
  floor?: number;
}) {
  const isMaster = c.author === MASTER_AUTHOR;
  return (
    <article
      className={cn(
        "flex items-start gap-3 rounded-sm border bg-paper-deep/40 px-3.5 py-3 transition-colors",
        replying
          ? "border-gilt/60 bg-gilt/5"
          : isMaster
            ? "border-gilt/40 bg-gilt/[0.06]"
            : "border-frame/60",
        compact && "py-2.5"
      )}
    >
      <span
        className={cn(
          "seal-stamp mt-0.5 shrink-0",
          compact ? "h-6 w-6 text-[0.55rem]" : "h-7 w-7 text-[0.62rem]"
        )}
      >
        {c.author.slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="inline-flex items-baseline gap-2">
            <span
              className={cn(
                "font-kai text-[0.82rem] tracking-[0.1em] text-ink",
                isMaster && "text-gilt"
              )}
            >
              {c.author}
            </span>
            {isMaster && (
              <span className="rounded-sm border border-gilt/50 px-1 py-px font-song text-[0.55rem] leading-none tracking-[0.2em] text-gilt">
                站主
              </span>
            )}
            {c.replyToAuthor && (
              <span className="inline-flex items-center gap-0.5 font-song text-[0.64rem] text-gilt">
                <CornerDownRight className="h-3 w-3" aria-hidden />
                复 {c.replyToAuthor}
              </span>
            )}
          </span>
          <span className="inline-flex items-baseline gap-2 font-song text-[0.66rem] tracking-wider text-ink-faint">
            {typeof floor === "number" && (
              <span
                className="tabular-nums text-ink-faint/80"
                title={`第 ${floor} 楼`}
              >
                #{floor}
              </span>
            )}
            {formatDate(c.createdAt)}
          </span>
        </div>
        <p
          className={cn(
            "mt-1 whitespace-pre-wrap break-words font-song text-[0.85rem] leading-6 text-ink-soft",
            compact && "text-[0.8rem] leading-5"
          )}
        >
          {c.body}
        </p>
        <div className="mt-1.5 flex items-center gap-3">
          <button
            onClick={() => onReply(c)}
            className="inline-flex items-center gap-1 font-song text-[0.68rem] tracking-[0.15em] text-ink-faint transition-colors hover:text-vermillion"
            aria-label={`复 ${c.author} 的留言`}
          >
            <MessageCircle className="h-3 w-3" aria-hidden />
            复
          </button>
          <ReactButton slug={slug} id={c.id} initial={c.reactions} />
        </div>
      </div>
    </article>
  );
}
