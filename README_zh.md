![Mission Control — OpenClaw GUI & AI Agent Dashboard](cover.png)

# Mission Control (中文版)

**你的 [OpenClaw](https://github.com/openclaw) 指挥中心。一屏总览，一键掌控。**

实时监控你的 AI 智能体。与它们对话。调度任务。追踪费用。管理记忆。一切在浏览器中完成，一切在你的设备上运行。

[English](./README.md) | 简体中文

---

## 为什么选择 Mission Control？

**告别繁琐的终端操作。** 如果你正在运行 OpenClaw，你已经感受到了它的强大。Mission Control 为你提供了一个直观的视图 —— 在一个地方即可查看智能体的动态、运行成本以及系统健康状况。

**数据永不离开你的设备。** Mission Control 100% 本地运行。无云端、无遥测、无账号。它只是一个连接到你电脑上已运行的 OpenClaw 系统的窗口。

**即装即用。** 安装，打开浏览器，搞定。Mission Control 会自动识别你的 OpenClaw 配置 —— 无需繁琐配置，无需填写环境文件，无需设置数据库。

---

## “薄层”设计理念

Mission Control **不是** 一个独立的平台。它不存储你的数据，不运行自己的数据库，也不试图成为“事实来源”。

相反，它是 OpenClaw 的一个**透明窗口**。你看到的每个屏幕、每个数字、每个状态都实时直接来自你正在运行的 OpenClaw 系统。当你在 Mission Control 中进行更改时，它会直接同步到 OpenClaw —— 无同步延迟，无陈旧缓存，无需“刷新以查看更新”。

**这对你意味着：**
- **始终准确** —— 你所看到的就是当下正在发生的。
- **无需维护** —— 无数据库迁移，无备份脚本，无清理任务。
- **极高稳定性** —— 即使 Mission Control 停止运行，你的智能体也会继续工作，不受影响。
- **瞬间设置** —— 无需配置存储空间，版本升级间无需迁移架构。

你可以把它想象成汽车的仪表盘。它显示速度、油量和引擎状态 —— 但拆掉它并不会让汽车停止行驶。这就是 Mission Control 与 OpenClaw 的关系。

---

## 核心功能

### 一眼总览全局
**仪表盘 (Dashboard)** 在你打开的一瞬间提供实时概览 —— 哪些智能体处于活跃状态、网关健康状况、正在运行的定时任务以及系统资源（CPU、内存、磁盘）。无需到处点击即可确认一切运行正常。

### 与你的智能体对话
**对话 (Chat)** 让你直接在浏览器中与任何智能体交谈。支持上传文件、选择模型并获取流式响应。在不同智能体间切换时不会丢失上下文。

### 视觉化组织工作
**任务 (Tasks)** 内置了看板（待办、进行中、审核、完成），并与你的工作空间同步。拖拽卡片，查看任务进度，让你的智能体保持专注。

### 自动化一切
**定时任务 (Cron Jobs)** 让你设置循环任务 —— 比如“每天早上总结收件箱”或“每小时检查更新”。创建、编辑、暂停并测试任务，拥有完整的运行历史记录。

### 掌控成本开支
**用量 (Usage)** 追踪每个模型和智能体的 Token 消耗。查看费用明细，发现哪些智能体消耗预算较多，通过图表直观理解资金去向。

### 管理智能体团队
**智能体 (Agents)** 以交互式组织架构图的形式展示你的智能体层级。查看谁在活跃、连接到哪些渠道、使用哪个工作空间，并能即时启动或关闭子智能体。

### 保持智能体记忆敏锐
**记忆 (Memory)** 让你查看并编辑智能体的长期记忆和每日日志。**向量搜索** 让你瞬间在智能体的语义记忆中找到任何内容。

### 模型与密钥管理
**模型 (Models)** 提供一个统一的地方查看所有可用的 AI 模型，设置供应商凭据，配置备用链，并为每个智能体切换模型。再也不用手动编辑配置文件。

### 系统健康诊断
**诊断 (Doctor)** 运行诊断程序，准确显示哪些部分健康、哪些需要注意，并提供常见问题的一键修复。**网关 (Gateway)** 状态始终可见，确保系统已连接。

### 内置终端
**终端 (Terminal)** 在仪表盘中提供完整的命令行支持 —— 多标签页、彩色显示，无需切换窗口。

### 社交平台集成
**渠道 (Channels)** 配置智能体与 Telegram、Discord、WhatsApp、Signal 和 Slack 的连接 —— 在支持的情况下支持二维码配对。

---

## 快速上手

### 1. 确保已安装 OpenClaw

```bash
# 如果尚未安装，请安装 OpenClaw
curl -fsSL https://openclaw.ai/install.sh | bash

# 验证运行状态
openclaw --version
```

### 2. 安装 Mission Control

```bash
cd ~/.openclaw
git clone https://github.com/lgl1996521/openclaw-mission-control.git
cd openclaw-mission-control
./setup.sh
```

就这样！在浏览器中打开 `http://localhost:3333` 即可。

---

## 常见问题 (FAQ)

<details>
<summary><strong>“找不到 OpenClaw” —— 我该怎么办？</strong></summary>

确保 `openclaw` 命令在你的终端中可用。如果终端可用但仪表盘报错，请尝试直接指定路径启动：

```bash
OPENCLAW_BIN=$(which openclaw) npm run dev
```
</details>

<details>
<summary><strong>这会发送我的数据到外部吗？</strong></summary>

不会。一切都在你的本地机器上运行。Mission Control 仅与你的本地 OpenClaw 安装通信，没有分析、没有追踪、没有云端调用。
</details>

---

## 许可证

MIT
