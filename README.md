# pi-timestamp

Pi extension — injects a timestamp into the conversation via system prompt + custom message.

## Features

- **LLM knows the time** via system prompt injection
- **Clean user messages** — no timestamp pollution in message history
- **Visual time label** — displayed as a custom message tag (`⏱ [05/30 22:15 Asia/Shanghai]`)
- **Cache-friendly** — user message history stays stable for prefix cache hits
- **Interval mode** — configurable time gap to save tokens (default 15 min)

## Install

```bash
pi install npm:pi-timestamp
```

## Configuration

```bash
# Interval between timestamps (minutes, default: 15, 0 = every message)
export TIMESTAMP_INTERVAL_MINUTES=15
```

## How it works

Uses `before_agent_start` to inject:
1. A system prompt append with current time (LLM sees it)
2. A custom message for TUI display (you see it as a tag)

This avoids modifying user input, keeping message history clean.

## License

MIT
