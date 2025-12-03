# 新手引导系统设计

## 目标与范围
- 在平台多页面（首页/列表/详情）提供统一的步骤式新手引导；通过配置实现复用，与业务逻辑解耦。

## 架构与模块
- 核心状态管理：`src/guide/GuideManager.js`
  - 负责流程注册、步骤切换、目标元素定位、滚动适配。
- 视图渲染层：`src/guide/GuideOverlay.vue`
  - 提供遮罩、目标高亮与提示弹层、操作按钮（上一步/下一步/跳过），可选调试信息。
- 流程配置：`src/guide/flows.js`
  - 针对路由（home/activities/activity-detail）定义步骤数组，包含 `title/content/selector/guard`。
- 插件集成：`src/guide/index.js` + `src/main.js` + `src/App.vue`
  - 全局注册 Overlay；在 App 顶部提供“新手引导”入口按当前路由启动。

## 关键接口说明
- `GuideManager.start(flowId, opts)`：启动指定流程；`opts.debug` 开启调试模式。
- `GuideManager.next()/prev()/stop()`：控制步骤切换与结束。
- 步骤结构：`{ title, content, selector, guard? }`
  - `selector`：定位元素（支持数组作为候选选择器）；
  - `guard`：布尔或函数，返回 false 时跳过该步骤（用于空列表、无权限等情况）。

## 数据差异与鲁棒性
- 列表为空：步骤 `guard` 检测容器或数据状态，必要时仅提示容器不高亮具体项。
- 权限差异：详情页“进入编辑”“提交更新”步骤受 `window.__hasEditPermission` 影响；不可见则跳过。
- 定位策略：优先使用稳定 `data-guide` 属性；支持多候选选择器以兼容小改动；提供调试模式显示当前选择器。

## 可视化调试与适配成本
- 调试模式：在提示弹层附近显示当前 `selector`；圈出目标元素的外框，便于校正配置。
- 滚动适配：每步自动 `scrollIntoView({ block: 'center' })`，保证提示上下文一致。

## 流程图（简化）
1. 用户点击“新手引导”
2. `GuideManager.start(routeName)` 加载对应 `flows[route]`
3. 执行 `guard` 过滤 -> 渲染 Overlay -> 高亮目标 -> 显示提示
4. 用户操作（下一步/上一步/跳过） -> 更新索引 -> 滚动定位 -> 重渲染
5. 完成或跳过 -> 关闭 Overlay

## 与现有页面整合度
- 已为首页、列表、详情关键元素添加 `data-guide`；引导按钮位于 `App` 顶部导航，随当前路由启动相应流程。
- 引导系统不依赖页面内部状态管理，使用选择器与守卫实现弱耦合。

## 后续扩展
- 交互类型扩展：点击、输入、校验步骤；
- 配置来源：支持从远端 JSON 拉取；
- AI 鲁棒性：根据元素文本、结构语义匹配尝试定位（可作为候选）；
- 可视化编辑器：以开发模式展示步骤列表与定位预览，支持拖拽调整顺序与选择器。
