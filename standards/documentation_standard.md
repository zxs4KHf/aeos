# AEOS 文档标准 v2.0

Status: active

## 一、文档对象

- 公共 API、复杂约束和非显然副作用应使用语言生态的标准文档格式。
- 行内注释解释原因、约束和历史陷阱，不复述代码语法。
- 私有且自解释的简单函数不要求形式化文档块。

示例：

```javascript
/**
 * Atomically replaces a generated file so readers never observe partial output.
 * @param {string} filePath absolute destination path
 * @param {string} content complete UTF-8 content
 */
function atomicWrite(filePath, content) {}
```

## 二、项目文档

仓库入口文档应提供项目定位、支持环境、关键命令、目录地图和当前边界。详细内容应链接到单一 source of truth，避免多个 README 重复同一事实。

## 三、更新条件

公共行为、运行命令、部署方式、架构边界、数据合同或长期决策变化时，在同一变更中更新对应文档。纯内部重构且行为不变时，不要求文档 churn。

## 四、可验证性

命令、路径、版本和示例应能被测试、链接检查或定期审查。计划中的能力必须标注 planned，不得写成已经实现。
