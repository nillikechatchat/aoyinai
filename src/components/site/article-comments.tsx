"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, PenLine, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/types";

interface CommentItem {
  id: string;
  articleSlug: string;
  author: string;
  body: string;
  createdAt: string;
}

const AUTHOR_KEY = "aoyin_comment_author";

/**
 * 笔谈（文章匿名留言板）
 * 挂载时拉取留言，落笔后即时插入列表顶部
 */
export function ArticleComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
        if (!cancelled && data.ok) setComments(data.comments);
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
        body: JSON.stringify({ author: author.trim(), body: text }),
      });
      const data = await res.json();
      if (!data.ok) {
        toast({ title: "未能落笔", description: data.error ?? "请稍后再试。" });
        return;
      }
      setComments((prev) => [data.comment, ...prev]);
      setBody("");
      try {
        if (author.trim()) localStorage.setItem(AUTHOR_KEY, author.trim());
      } catch {
        // ignore
      }
      toast({ title: "已落笔", description: "留言已录入笔谈，与后来者共赏。" });
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      });
    } catch {
      toast({ title: "未能落笔", description: "网络异常，请稍后再试。" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-9" aria-label="笔谈留言板">
      <div className="flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 font-kai text-base tracking-[0.25em] text-ink">
          <ScrollText className="h-4 w-4 text-gilt" aria-hidden />
          笔谈
          {!loading && (
            <span className="font-song text-xs tracking-normal text-ink-faint">
              （{comments.length}）
            </span>
          )}
        </h3>
        <span className="font-song text-[0.68rem] tracking-[0.2em] text-ink-faint">
          读后有所感，且留数行
        </span>
      </div>

      <div className="ink-divider mt-3" />

      {/* 留言列表 */}
      <div
        ref={listRef}
        className="custom-scrollbar mt-4 max-h-64 space-y-3 overflow-y-auto pr-1"
      >
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-ink-faint">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <span className="font-song text-xs tracking-[0.2em]">翻阅笔谈中…</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="seal-outline h-9 w-9 text-[0.72rem]">谈</span>
            <p className="font-kai text-sm tracking-[0.25em] text-ink-soft">笔谈尚无留痕</p>
            <p className="font-song text-xs text-ink-faint">读罢此文，若有会心处，欢迎落笔一二</p>
          </div>
        ) : (
          comments.map((c, i) => (
            <article
              key={c.id}
              className="flex items-start gap-3 rounded-sm border border-frame/60 bg-paper-deep/40 px-3.5 py-3"
              style={{
                animation: `fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) ${Math.min(i * 0.04, 0.3)}s both`,
              }}
            >
              <span className="seal-stamp mt-0.5 h-7 w-7 shrink-0 text-[0.62rem]">
                {c.author.slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-kai text-[0.82rem] tracking-[0.1em] text-ink">
                    {c.author}
                  </span>
                  <span className="font-song text-[0.66rem] tracking-wider text-ink-faint">
                    {formatDate(c.createdAt)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words font-song text-[0.85rem] leading-6 text-ink-soft">
                  {c.body}
                </p>
              </div>
            </article>
          ))
        )}
      </div>

      {/* 落笔表单 */}
      <div className="mt-4 rounded-sm border border-frame/70 bg-paper-card p-3.5">
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
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 500))}
          rows={3}
          placeholder="写下读后所感…（五百字以内）"
          className="custom-scrollbar mt-2 border-frame bg-paper font-song text-sm leading-6 placeholder:text-ink-faint/70 focus-visible:ring-vermillion/40"
          aria-label="留言内容"
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
            ) : (
              <PenLine className="h-4 w-4" aria-hidden />
            )}
            落笔
          </Button>
        </div>
      </div>
    </section>
  );
}
