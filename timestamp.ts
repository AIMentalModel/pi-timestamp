import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("input", async (event, _ctx) => {
    // 从 event 中取用户输入文本
    const text = (event as any).text ?? (event as any).input?.text ?? "";
    if (!text) return { action: "continue" };

    // 斜杠命令和 shell 命令不加时间戳
    if (text.startsWith("/") || text.startsWith("!")) {
      return { action: "continue" };
    }

    const now = new Date();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timeStr = now.toLocaleString("zh-CN", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const timestamp = `[${timeStr} ${tz}]`;

    // 返回 transform 让 pi 用修改后的文本
    return { action: "transform", text: `${timestamp}\n${text}` };
  });
}
