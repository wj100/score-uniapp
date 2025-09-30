# 羽毛球记分小程序

一个基于 uni-app 开发的羽毛球比赛记分小程序，支持单打和双打比赛记录，并提供详细的战绩统计功能。

## 📱 项目简介

这是一个羽毛球记分小程序，主要功能包括：
- 单打比赛记分
- 双打比赛记分  
- 比赛战绩统计
- 选手管理
- 云数据库存储

## 🏗️ 技术栈

- **前端框架**: uni-app (Vue 3)
- **UI组件**: @dcloudio/uni-ui
- **云服务**: uniCloud (阿里云)
- **数据库**: MongoDB
- **开发工具**: HBuilderX

## 📁 项目结构

```
score-uniapp/
├── 📄 App.vue                    # 应用主入口
├── 📄 main.js                    # 应用启动文件
├── 📄 manifest.json              # 应用配置文件
├── 📄 pages.json                 # 页面路由配置
├── 📄 index.html                 # 网页端入口
├── 📄 uni.scss                   # 全局样式文件
├── 📄 uni.promisify.adaptor.js   # Promise适配器
│
├── 📁 pages/                     # 页面目录
│   ├── 📁 single/               # 单打页面
│   │   └── 📄 single.vue        # 单打记分页面
│   ├── 📁 single-stats/         # 单打战绩页面
│   │   └── 📄 single-stats.vue  # 单打战绩统计页面
│   ├── 📁 double/               # 双打页面
│   │   └── 📄 double.vue        # 双打记分页面
│   ├── 📁 double-stats/         # 双打战绩页面
│   │   └── 📄 double-stats.vue  # 双打战绩统计页面
│   └── 📄 test.vue              # 测试页面
│
├── 📁 static/                    # 静态资源目录
│   └── 📁 image/                # 图片资源
│       ├── 🖼️ 1.png
│       ├── 🖼️ 2.png
│       ├── 🖼️ 3.png
│       ├── 🖼️ 4.png
│       └── 🖼️ 5.png
│
├── 📁 utils/                     # 工具函数目录
│   └── 📄 storage.js            # 本地存储工具
│
├── 📁 data/                      # 数据目录
│   ├── 📄 convert_data_enhanced.py  # 数据转换脚本（增强版）
│   ├── 📄 scoring_match.json        # 比赛记录数据
│   ├── 📄 scoring_player_match.json # 选手比赛数据
│   ├── 📄 source.json               # 原始数据
│   └── 📄 数据转换说明.md            # 数据转换文档
│
├── 📁 uniCloud-aliyun/          # 阿里云云服务目录
│   ├── 📁 cloudfunctions/       # 云函数目录
│   │   └── 📁 badminton-api/    # 羽毛球API云函数
│   │       ├── 📄 index.js      # 云函数主文件
│   │       ├── 📄 package.json  # 云函数依赖
│   │       └── 📄 delete-functions.js # 删除函数脚本
│   └── 📁 database/             # 数据库配置目录
│       ├── 📄 db_init.json      # 数据库初始化配置
│       ├── 📄 JQL查询.jql       # JQL查询语句
│       ├── 📄 players.schema.json        # 选手表结构
│       ├── 📄 scoring_match.schema.json  # 比赛记录表结构
│       └── 📄 scoring_player_match.schema.json # 选手比赛表结构
│
├── 📁 uni_modules/              # uni-app模块目录
│   ├── 📁 uni-config-center/    # 配置中心模块
│   ├── 📁 uni-icons/            # 图标组件模块
│   ├── 📁 uni-id-common/        # 用户身份认证模块
│   └── 📁 uni-scss/             # SCSS样式模块
│
├── 📁 unpackage/                # 编译输出目录
│   └── 📁 dist/                 # 编译后的文件
│       ├── 📁 build/            # 构建文件
│       └── 📁 dev/              # 开发文件
│
├── 📁 node_modules/             # Node.js依赖包
├── 📄 package.json              # 项目依赖配置
└── 📄 package-lock.json         # 依赖版本锁定文件
```

## 🚀 功能特性

### 🏸 比赛记分
- **单打记分**: 支持两人单打比赛记分
- **双打记分**: 支持四人双打比赛记分
- **实时比分**: 实时更新比赛比分
- **比赛记录**: 自动保存比赛记录到云端

### 📊 战绩统计
- **单打战绩**: 查看单打比赛历史记录
- **双打战绩**: 查看双打比赛历史记录
- **胜负统计**: 统计选手胜负情况
- **积分排行**: 选手积分排行榜

### 👥 选手管理
- **选手列表**: 管理所有参赛选手
- **选手信息**: 维护选手基本信息
- **比赛历史**: 查看选手比赛历史

## 🛠️ 开发环境设置

### 前置要求
- Node.js 14.0+
- HBuilderX 3.0+
- 微信开发者工具（用于小程序调试）

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd score-uniapp
```

2. **安装依赖**
```bash
npm install
```

3. **配置云服务**
   - 在 HBuilderX 中打开项目
   - 配置 uniCloud 服务
   - 关联阿里云账号

4. **运行项目**
   - 在 HBuilderX 中点击"运行" -> "运行到小程序模拟器"
   - 或使用命令行：`npm run dev:mp-weixin`

## 📱 页面说明

### 单打页面 (`pages/single/single.vue`)
- 选择两位选手进行单打比赛
- 输入比赛比分
- 提交比赛结果

### 双打页面 (`pages/double/double.vue`)
- 选择四位选手组成两队进行双打比赛
- 输入比赛比分
- 提交比赛结果

### 战绩统计页面
- `pages/single-stats/single-stats.vue`: 单打战绩统计
- `pages/double-stats/double-stats.vue`: 双打战绩统计

## 🗄️ 数据库结构

### 选手表 (players)
```json
{
  "_id": "选手ID",
  "name": "选手姓名",
  "created_at": "创建时间"
}
```

### 比赛记录表 (scoring_match)
```json
{
  "_id": "比赛ID",
  "match_type": 1, // 1:单打 2:双打
  "player1": "选手1",
  "player2": "选手2",
  "score1": 15,
  "score2": 13,
  "time": "比赛时间"
}
```

### 选手比赛表 (scoring_player_match)
```json
{
  "_id": "记录ID",
  "match_id": "比赛ID",
  "player": "选手姓名",
  "score": 15,
  "result": 1, // 1:胜利 0:失败
  "match_type": 1
}
```

## 🔧 云函数说明

### badminton-api 云函数
提供以下API接口：
- `getPlayers`: 获取选手列表
- `addPlayer`: 添加新选手
- `submitSingleMatch`: 提交单打比赛
- `submitDoubleMatch`: 提交双打比赛
- `getSingleMatches`: 获取单打比赛记录
- `getDoubleMatches`: 获取双打比赛记录
- `getPlayerStats`: 获取选手统计信息

## 📊 数据转换工具

项目提供了数据转换脚本 (`data/convert_data_enhanced.py`)，用于将旧格式的比赛数据转换为新的数据库格式。

详细说明请参考：[数据转换说明.md](./data/数据转换说明.md)

## 🎨 界面设计

- 采用绿色主题色 (#4CAF50)，符合羽毛球运动特色
- 简洁直观的操作界面
- 响应式设计，适配不同屏幕尺寸
- 底部Tab导航，便于功能切换

## 📝 开发日志

- **v1.0.0**: 基础功能实现
  - 单打/双打记分功能
  - 战绩统计功能
  - 云数据库集成

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件至项目维护者

---

**注意**: 本项目仅供学习和参考使用，请勿用于商业用途。
