import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CheckSquareOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import './App.css';
import TodoManagement from './pages/TodoManagement';
import StudentManagement from './pages/StudentManagement';
import ClassManagement from './pages/ClassManagement';
import RecordManagement from './pages/RecordManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import GradeManagement from './pages/GradeManagement';
import ScheduleManagement from './pages/ScheduleManagement';
import Statistics from './pages/Statistics';
import Dashboard from './pages/Dashboard';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页概览',
    },
    {
      key: '/todos',
      icon: <CheckSquareOutlined />,
      label: '待办事项',
    },
    {
      key: '/students',
      icon: <UserOutlined />,
      label: '学生管理',
    },
    {
      key: '/classes',
      icon: <TeamOutlined />,
      label: '班级管理',
    },
    {
      key: '/records',
      icon: <FileTextOutlined />,
      label: '学籍管理',
    },
    {
      key: '/attendance',
      icon: <CalendarOutlined />,
      label: '考勤管理',
    },
    {
      key: '/grades',
      icon: <TrophyOutlined />,
      label: '成绩管理',
    },
    {
      key: '/schedules',
      icon: <CalendarOutlined />,
      label: '课表管理',
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: '数据统计',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}>
          {collapsed ? '学管' : '学生管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => {
            navigate(key);
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: () => setCollapsed(!collapsed),
            style: { fontSize: 18, padding: '0 24px', cursor: 'pointer', lineHeight: '64px' }
          })}
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/todos" element={<TodoManagement />} />
            <Route path="/students" element={<StudentManagement />} />
            <Route path="/classes" element={<ClassManagement />} />
            <Route path="/records" element={<RecordManagement />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/grades" element={<GradeManagement />} />
            <Route path="/schedules" element={<ScheduleManagement />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
