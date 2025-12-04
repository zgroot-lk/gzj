import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import { UserOutlined, TeamOutlined, CheckSquareOutlined, TrophyOutlined } from '@ant-design/icons';
import { statisticsAPI } from '../utils/api';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await statisticsAPI.getOverview();
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error: any) {
      message.error('加载数据失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '50px' }} />;
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>系统概览</h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="学生总数"
              value={data.students || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="班级总数"
              value={data.classes || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待办事项"
              value={data.todos?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0}
              prefix={<CheckSquareOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均成绩"
              value={data.grades?.avg_score ? parseFloat(data.grades.avg_score).toFixed(1) : 0}
              prefix={<TrophyOutlined />}
              suffix="分"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="待办事项统计">
            {data.todos?.map((item: any, index: number) => (
              <div key={index} style={{ marginBottom: 8 }}>
                {item.status}: {item.total} 项
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="考勤统计">
            <div>总记录数: {data.attendance?.total || 0}</div>
            <div>出勤: {data.attendance?.attendance_count || 0}</div>
            <div>缺勤: {data.attendance?.absence_count || 0}</div>
            {data.attendance?.total > 0 && (
              <div>
                出勤率: {((data.attendance.attendance_count / data.attendance.total) * 100).toFixed(1)}%
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;


