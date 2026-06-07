# EducationSpace

小学数学**概念骨架**梳理工具。把每个核心概念拆成独立、自洽、可对照的卡片，
帮孩子（笑笑·六年级 / 泽泽·三年级）重建数学概念的边界、反例与相邻关系。

项目定位详见 [NORTH_STAR.md](./NORTH_STAR.md)。

## 技术栈

Vite 6 + Vue 3 + TypeScript + Tailwind CSS + Pinia + Vue Router。
卡片内容以 Markdown（带 frontmatter）形式存放在 [src/data/cards/](./src/data/cards/)。

## 环境要求

- Node.js ≥ 18（开发使用 v24）
- npm（开发使用 v11）

## 启动步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

启动后访问 `http://localhost:5173`。

dev 服务器配置为 `host: 0.0.0.0`（见 [vite.config.ts](./vite.config.ts)），
所以同一局域网内的其他设备（手机 / 平板 / 投屏）也可以通过
`http://<本机IP>:5173` 访问 —— 这对兄妹抢答、投屏使用很方便。

## 生产构建

### 构建

```bash
npm run build
```

先执行 `vue-tsc -b` 做类型检查，再用 Vite 打包，产物输出到 [dist/](./dist/)。

### 本地预览构建产物

```bash
npm run preview
```

`preview` 同样以 `--host` 暴露到局域网。

## 路由说明

使用 hash 路由（`createWebHashHistory`，见 [src/router.ts](./src/router.ts)），
因此可直接用静态文件托管 `dist/`，无需服务端 rewrite 配置。

| 路径 | 说明 |
| --- | --- |
| `/` | 首页 |
| `/browse` | 卡片浏览 |
| `/topic/:id` | 按主题浏览 |
| `/card/:id` | 卡片详情 |
| `/study/:topicId/:idx?` | 专注学习模式 |

## 新增卡片

1. 在 [src/data/cards/](./src/data/cards/) 对应主题目录下新建 `.md` 文件
2. 参照 [src/data/cards/CARD_TEMPLATE.md](./src/data/cards/CARD_TEMPLATE.md) 填写
   frontmatter 与概念骨架（适用范围 / 精确定义 / 多角度逼近 / 常见陷阱 / 相邻概念）
3. 主题清单维护在 [src/data/topics.ts](./src/data/topics.ts)

## 操作支持

支持键盘、投屏遥控及北通手柄进行卡片翻页 / 抢答交互。
