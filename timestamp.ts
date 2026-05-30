import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/**
 * Timestamp Extension — C方案（final）
 *
 * 目标：LLM 知道时间 + 不污染 user 消息 + 不破坏 cache + ↑ 回溯干净
 * 方法：before_agent_start 注入 custom message + system prompt
 *
 * 验证结果：
 * - TUI 显示：✅ custom message 以 ⏱ [时间] 形式显示
 * - LLM 接收：✅ system prompt 注入，LLM 能看到时间
 * - session 记录：custom message 可能不被持久化（不影响功能）
 * - cache：✅ user 消息干净，历史前缀稳定
 *
 * Interval 策略：默认 15 分钟，跨时段才注入，节省 token
 * 配置：TIMESTAMP_INTERVAL_MINUTES（默认 15，0=每条都加）
 */

const INTERVAL_MS = (parseInt(process.env.TIMESTAMP_INTERVAL_MINUTES ?? "15", 10)) * 60 * 1000;

function formatTimestamp(now: Date): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeStr = now.toLocaleString("zh-CN", {
    timeZone: tz,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `[${timeStr} ${tz}]`;
}

export default function (pi: ExtensionAPI) {
  let lastInjectTime: number | null = null;

  pi.on("before_agent_start", async (event, _ctx) => {
    // 没有 prompt 的回合跳过
    if (!event.prompt) return {};

    const now = Date.now();

    // Interval 策略
    if (INTERVAL_MS > 0 && lastInjectTime !== null && (now - lastInjectTime) < INTERVAL_MS) {
      return {};
    }

    lastInjectTime = now;
    const timestamp = formatTimestamp(new Date(now));

    return {
      // 保底：system prompt 追加时间，确保 LLM 上下文里一定能看到
      systemPrompt: event.systemPrompt + `\n\n[当前时间: ${timestamp}]`,
      // TUI 显示：custom message，视觉上呈现为独立时间标签
      message: {
        customType: "timestamp",
        content: `⏱ ${timestamp}`,
        display: true,
      },
    };
  });
}
