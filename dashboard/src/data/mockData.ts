import type { DashboardData } from "../types";

export const dashboardMock: DashboardData = {
  gateway: {
    status: "Running",
    pid: 1234,
    uptime: "2 小时 41 分",
  },
  statusCards: [
    {
      id: "gateway",
      title: "Gateway 状态",
      value: "运行中",
      badge: "状态良好",
      tone: "mint",
      icon: "gateway",
      details: [
        { label: "进程 ID", value: "1234" },
        { label: "运行时长", value: "2 小时 41 分" },
        { label: "监听端口", value: "Gateway 默认端口" },
      ],
    },
    {
      id: "terminal",
      title: "Terminal 后端",
      value: "本地模式",
      badge: "连接稳定",
      tone: "sky",
      icon: "terminal",
      details: [
        { label: "当前后端", value: "local" },
        { label: "连接状态", value: "已连接" },
        { label: "预计延迟", value: "24 ms" },
      ],
    },
    {
      id: "proxy",
      title: "代理配置",
      value: "已连接",
      badge: "本地优先",
      tone: "blue",
      icon: "proxy",
      details: [
        { label: "服务地址", value: "127.0.0.1" },
        { label: "本地服务", value: "已绕过代理" },
      ],
    },
    {
      id: "voice",
      title: "语音状态",
      value: "已开启",
      badge: "可以说话",
      tone: "sun",
      icon: "voice",
      details: [
        { label: "TTS 引擎", value: "GPT-SoVITS" },
        { label: "语音", value: "阳菜" },
        { label: "速率", value: "1.0x" },
      ],
    },
    {
      id: "persona",
      title: "阳菜当前模式",
      value: "温柔陪伴",
      badge: "晴天模式",
      tone: "peach",
      icon: "persona",
      details: [
        { label: "响应风格", value: "温暖贴心" },
        { label: "语气", value: "轻柔" },
      ],
    },
  ],
  proxy: {
    http_proxy: "<configured at runtime>",
    https_proxy: "<configured at runtime>",
    all_proxy: "<configured at runtime>",
    no_proxy: "127.0.0.1,localhost",
  },
  config: {
    configFile: "${HOME}/.hermes/config.yaml",
    gatewayLog: "${HOME}/.hermes/logs/gateway.log",
    workspace: "${HOME}/projects/hina-companion-system",
  },
  logs: [
    {
      id: 1,
      timestamp: "16:25:04",
      level: "INFO",
      message: "Hermes Gateway 正在使用代理环境启动",
    },
    {
      id: 2,
      timestamp: "16:25:05",
      level: "INFO",
      message: "微信适配器已加载，正在等待新消息",
    },
    {
      id: 3,
      timestamp: "16:25:05",
      level: "SUCCESS",
      message: "Gateway 已连接，阳菜醒着呢～",
    },
    {
      id: 4,
      timestamp: "16:28:42",
      level: "INFO",
      message: "GPT-SoVITS 本地语音服务可用，端口 9880",
    },
    {
      id: 5,
      timestamp: "16:31:18",
      level: "WARN",
      message: "当前 Dashboard 使用模拟数据，尚未连接真实控制接口",
    },
    {
      id: 6,
      timestamp: "16:35:51",
      level: "INFO",
      message: "本地会话状态同步完成",
    },
  ],
  activities: [
    {
      id: 1,
      title: "Gateway 已启动",
      description: "微信消息桥接保持在线",
      time: "2 分钟前",
      type: "gateway",
    },
    {
      id: 2,
      title: "语音管线准备完成",
      description: "微信版 SILK 输出配置正常",
      time: "18 分钟前",
      type: "voice",
    },
    {
      id: 3,
      title: "代理地址已刷新",
      description: "已识别 Windows 主机网关",
      time: "42 分钟前",
      type: "proxy",
    },
    {
      id: 4,
      title: "配置检查完成",
      description: "Hermes 本地设置读取正常",
      time: "1 小时前",
      type: "config",
    },
  ],
  taskStatus: null,
};
