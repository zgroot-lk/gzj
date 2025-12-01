# 学生管理系统

一个功能完整的学生管理系统，包含学生基础信息、班级信息、学籍信息、课表、考勤、成绩等核心业务数据管理功能。

## 功能特性

### 核心业务数据管理
- ✅ 待办事项管理：支持创建、编辑、删除待办事项，可按状态、优先级、时间等筛选
- ✅ 学生基础信息管理：完整的CRUD操作，支持学号、姓名、性别、联系方式等信息
- ✅ 班级信息管理：班级创建、编辑，自动统计学生人数
- ✅ 学籍信息管理：身份证号、民族、政治面貌、监护人等详细信息
- ✅ 课表管理：课程安排、时间、教室等信息
- ✅ 考勤管理：记录学生出勤、迟到、缺勤等情况
- ✅ 成绩管理：考试成绩录入、查询、统计

### 多维度数据查询
- ✅ 按时间区间查询：支持开始日期和结束日期筛选
- ✅ 按待办状态查询：待处理、进行中、已完成、已取消
- ✅ 按学生年级班级查询：支持年级、部门、班级多维度筛选
- ✅ 按考勤状态查询：出勤、迟到、早退、缺勤、请假
- ✅ 按学生状态查询：在读、休学、退学、毕业

### 数据统计功能
- ✅ 数量统计：按时间区间、部门年级班级、状态的数量统计
- ✅ 增量统计（趋势分析）：支持按天、周、月、年分组统计
- ✅ 数据对比：支持两个时间段的对比分析
- ✅ 综合统计概览：系统整体数据概览

## 数据库设计

系统包含7张核心数据表（满足≥6张表的要求）：

1. **classes** - 班级信息表
2. **students** - 学生基础信息表
3. **student_records** - 学籍信息表
4. **schedules** - 课表信息表
5. **attendance** - 考勤信息表
6. **grades** - 成绩信息表
7. **todos** - 待办事项表

## 技术栈

### 后端
- Node.js + Express
- MySQL数据库
- RESTful API设计

### 前端
- React + TypeScript
- Ant Design UI组件库
- React Router路由管理
- Axios HTTP客户端

## 安装和运行

### 1. 环境要求
- Node.js >= 14.0.0
- MySQL >= 5.7

### 2. 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

### 3. 数据库配置

1. 创建MySQL数据库：
```sql
CREATE DATABASE student_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 复制环境变量配置文件：
```bash
cp .env.example .env
```

3. 编辑 `.env` 文件，配置数据库连接信息：
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_management
PORT=3001
```

4. 导入数据库表结构：
```bash
mysql -u root -p student_management < database/schema.sql
```

5. （可选）导入测试数据：
```bash
mysql -u root -p student_management < database/init.sql
```

### 4. 启动服务

#### 方式一：分别启动（推荐开发环境）

```bash
# 启动后端服务（在项目根目录）
npm run server

# 启动前端服务（新开一个终端）
cd client
npm start
```

#### 方式二：同时启动（需要安装concurrently）

```bash
# 在项目根目录执行
npm run dev
```

### 5. 访问系统

- 前端地址：http://localhost:3000
- 后端API：http://localhost:3001

## 项目结构

```
学生管理系统/
├── client/                 # 前端React应用
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── utils/         # 工具函数（API配置）
│   │   ├── App.tsx        # 主应用组件
│   │   └── index.tsx     # 入口文件
│   └── package.json
├── server/                 # 后端Express应用
│   ├── config/            # 配置文件（数据库连接）
│   ├── routes/            # 路由处理
│   │   ├── todos.js       # 待办事项路由
│   │   ├── students.js    # 学生管理路由
│   │   ├── classes.js     # 班级管理路由
│   │   ├── records.js     # 学籍管理路由
│   │   ├── attendance.js  # 考勤管理路由
│   │   ├── grades.js      # 成绩管理路由
│   │   ├── schedules.js   # 课表管理路由
│   │   └── statistics.js  # 统计路由
│   └── index.js           # 服务器入口
├── database/              # 数据库相关
│   ├── schema.sql         # 数据库表结构
│   └── init.sql           # 初始化测试数据
├── package.json           # 后端依赖配置
└── README.md             # 项目说明文档
```

## API接口说明

### 待办事项
- `GET /api/todos` - 获取待办事项列表（支持多维度查询）
- `GET /api/todos/:id` - 获取单个待办事项
- `POST /api/todos` - 创建待办事项
- `PUT /api/todos/:id` - 更新待办事项
- `DELETE /api/todos/:id` - 删除待办事项

### 学生管理
- `GET /api/students` - 获取学生列表（支持多维度查询）
- `GET /api/students/:id` - 获取单个学生信息
- `POST /api/students` - 创建学生
- `PUT /api/students/:id` - 更新学生信息
- `DELETE /api/students/:id` - 删除学生

### 统计功能
- `GET /api/statistics/count` - 数量统计
- `GET /api/statistics/trend` - 趋势分析
- `GET /api/statistics/compare` - 数据对比
- `GET /api/statistics/overview` - 综合概览

更多API接口请参考 `server/routes/` 目录下的路由文件。

## 使用说明

1. **待办事项管理**：在"待办事项"页面可以创建、编辑、删除待办事项，支持按状态、优先级、时间等条件筛选。

2. **学生管理**：在"学生管理"页面可以管理学生基础信息，支持按姓名、学号、班级、年级等多维度查询。

3. **数据统计**：在"数据统计"页面可以进行：
   - 数量统计：按时间、部门、年级、班级、状态等维度统计
   - 趋势分析：查看数据的时间趋势变化
   - 数据对比：对比两个时间段的数据差异

## 注意事项

1. 确保MySQL服务已启动
2. 确保数据库连接配置正确
3. 首次运行建议导入测试数据以便测试功能
4. 前端默认运行在3000端口，后端默认运行在3001端口

## 开发计划

- [ ] 用户认证和权限管理
- [ ] 数据导出功能（Excel、PDF）
- [ ] 数据可视化图表
- [ ] 消息通知功能
- [ ] 移动端适配

## 许可证

MIT License


