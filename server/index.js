const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 路由
const todoRoutes = require('./routes/todos');
const studentRoutes = require('./routes/students');
const classRoutes = require('./routes/classes');
const recordRoutes = require('./routes/records');
const attendanceRoutes = require('./routes/attendance');
const gradeRoutes = require('./routes/grades');
const scheduleRoutes = require('./routes/schedules');
const statisticsRoutes = require('./routes/statistics');

app.use('/api/todos', todoRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/statistics', statisticsRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '学生管理系统API运行正常' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});


