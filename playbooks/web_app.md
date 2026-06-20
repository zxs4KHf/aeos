# 🌐 Web 应用开发手册 (Web Application Playbook) v0.4.0

本手册规范了前端 Web 应用（Vite / React / Next.js 或 HTML+JS）的界面设计系统、组件工程化、API 抽象及多模态界面审查的标准操作程序 (SOP)。

---

## 一、 标准目录结构

前端项目采用高内聚、易于分层打包的经典组织结构：

```text
my-web-app/
├── public/               # 静态资源、图标、多媒体文件
├── src/
│   ├── assets/           # 需要经由构建工具打包的资源
│   ├── components/       # 可复用无状态/低状态 UI 组件（如 Button, Card）
│   ├── contexts/         # 全局状态管理上下文（如 ThemeContext）
│   ├── hooks/            # 自定义 Hook 逻辑抽象（如 useFetch）
│   ├── services/         # API 网络层封装及 Mock 控制适配器
│   ├── styles/           # 设计系统核心 CSS（变量、全局布局、微动画）
│   │   ├── index.css     # 主样式入口与重置
│   │   └── theme.css     # 调色盘与字重系统变量
│   ├── views/            # 核心业务页面路由组件
│   ├── App.jsx           # 应用主骨架
│   └── main.jsx          # 打包挂载入口
├── index.html            # 主 HTML 页面（包含 SEO 配置元数据）
└── package.json          # 依赖管理
```

---

## 二、 极致设计美学与 CSS 规范 (Aesthetics & CSS)

AEOS 的前端项目严禁开发简单、丑陋的 MVP 界面。必须从色彩、排版、阴影与过渡动画四个维度体现“高级感”。

### 2.1 主题变量规范 (Design System Tokens)
在 `theme.css` 中必须预定义 CSS 变量，严禁在组件中使用随意指定的十六进制颜色值。
```css
:root {
  /* 莫兰迪/暗黑主色调 */
  --bg-primary: #0a0c10;
  --bg-secondary: #141822;
  --bg-tertiary: #1f2538;
  
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  
  --accent-color: #6366f1; /* 靛蓝微光 */
  --accent-hover: #4f46e5;
  
  /* 弥散阴影与模糊 */
  --glass-bg: rgba(20, 24, 34, 0.7);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-blur: blur(12px);
  --shadow-premium: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  
  /* 圆角与过渡 */
  --radius-lg: 16px;
  --radius-md: 8px;
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 2.2 渐进微动画 (Micro-Animations)
对可交互元素（按钮、卡片、菜单）必须设置平滑过渡动画：
```css
.card-hover-effect {
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  transition: var(--transition-smooth);
}

.card-hover-effect:hover {
  transform: translateY(-4px);
  border-color: var(--accent-color);
  box-shadow: var(--shadow-premium);
  background: var(--bg-tertiary);
}
```

---

## 三、 API 隔离与 Mock 服务适配

为保证前端项目的自测试效率，必须实现 API 层与业务逻辑层的解耦。在开发与测试环境中应通过开关切换至 Mock 模拟数据，防止后端 API 离线导致系统报错崩溃。

```javascript
// services/api_client.js
import { mockData } from './mock_data.js';

const USE_MOCK = process.env.NODE_ENV === 'development' || true;

export async function fetchUserData(userId) {
  if (USE_MOCK) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockData.users[userId] || null;
  }
  
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) throw new Error('API 调用失败');
  return response.json();
}
```

---

## 四、 界面核验与多模态视检流程 (SOP)

当前端任务完成并部署至本地服务器（如运行 `npm run dev`）后，智能体在提交代码前，必须进行以下多模态自检：

1. **部署本地环境**：启动开发服务器，获取 `http://localhost:5173`。
2. **截取屏幕画面**：利用多模态截图工具捕获当前渲染页面。
3. **多模态视觉比对**：
   - 检查界面是否包含明显的“未加载占位符”或 `undefined` 字样。
   - 检查暗色模式或莫兰迪色系的还原度，确保无刺眼的纯红纯蓝等原色。
   - 确认响应式布局——拉伸宽度至 375px（移动端）和 1440px（PC端），核实文字无换行溢出、组件无重叠。
4. **生成 Walkthrough 并附带截图**：在提交报告中插入此自测截图，确保用户可直观检验 UI 还原效果。

---

## 五、 构建与发布规范

- 运行 `npm run build` 验证生产打包无报错，无 phantom dependencies（幽灵依赖）导致的编译失败。
- 打包输出目录（如 `dist/`）应加入 `.gitignore` 过滤，保持代码库的纯净度。
