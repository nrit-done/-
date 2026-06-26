# JobPilot

面向前端求职者的岗位管理、面试推进、技能分析、作品集展示和简历生成平台。

## 已完成功能

- 账号注册、登录、签名 HttpOnly 会话和用户数据隔离
- 账号级岗位、面试、简历与设置数据持久化
- 仪表盘真实统计、近 7 天投递趋势、渠道和状态分布
- 岗位搜索、筛选、分页、新增、编辑、删除和 CSV 导出
- 面试看板、阶段拖拽、详情记录、日历提醒和 JSON 导出
- 技术栈匹配分析、技能缺口与学习计划
- 作品集主页、项目详情和技能证据
- 简历生成、ATS 评分、三套模板和打印导出 PDF
- 浅色、深色、系统主题和信息密度设置
- 全局加载、错误处理和 404 页面
- GitHub Actions、Docker 和 Next.js standalone 部署

## 技术栈

- Next.js 16、React 19、TypeScript
- Tailwind CSS v4、Radix UI、lucide-react
- Recharts
- Next.js Route Handlers
- JSON 文件数据库、scrypt 密码哈希

## 本地启动

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

演示账号：

```text
邮箱：demo@jobpilot.local
密码：jobpilot123
```

## 页面

- `/`：仪表盘
- `/jobs`：岗位管理
- `/interviews`：面试流程
- `/skills`：技能分析
- `/portfolio`：作品集
- `/resume`：简历生成器
- `/settings`：个人设置
- `/system`：系统状态

## API

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET/DELETE /api/auth/session`
- `GET /api/dashboard`
- `GET/PUT /api/jobs`
- `GET/PUT /api/interviews`
- `GET/PUT /api/resume`
- `GET/PUT /api/settings`

所有业务 API 都从签名会话读取用户 ID，不接受客户端指定用户 ID。数据默认保存在 `.jobpilot/jobpilot-db.json`，目录已加入 `.gitignore`。

## 环境变量

```text
JOBPILOT_SESSION_SECRET=生产环境随机密钥
JOBPILOT_DATA_DIR=.jobpilot
JOBPILOT_SECURE_COOKIES=false
```

HTTPS 部署时将 `JOBPILOT_SECURE_COOKIES` 设置为 `true`。

## 验证

```bash
npm run typecheck
npm run lint
npm run build
npm run verify:backend
```

`.github/workflows/ci.yml` 会在推送和 Pull Request 时自动执行类型检查、Lint、生产构建及后端 API 验收。

## Docker

```bash
docker compose up --build
```

容器使用 `/app/data` 数据卷保存文件数据库。

## 后续方向

- PostgreSQL 数据库和迁移工具
- 管理员与普通用户权限模型
- 审计日志、错误监控和性能监控
- 更完整的 Playwright E2E 回归测试
- 云端正式部署与自动备份
