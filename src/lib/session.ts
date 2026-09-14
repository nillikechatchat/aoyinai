/**
 * 访客会话标识：用于「我的签筒」数据隔离
 * 首次访问生成并写入 localStorage，此后所有问签/查询携带同一 id
 */
const SESSION_KEY = "aoyin_session_id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}
