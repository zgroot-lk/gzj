import React, { useState } from 'react';
import {
  Card, Form, Select, DatePicker, Button, Table, Row, Col, Statistic, message, Tabs, Input
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { statisticsAPI } from '../utils/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const Statistics: React.FC = () => {
  const [countForm] = Form.useForm();
  const [trendForm] = Form.useForm();
  const [compareForm] = Form.useForm();
  const [countData, setCountData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [compareData, setCompareData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleCountSearch = async (values: any) => {
    try {
      setLoading(true);
      const params: any = {
        type: values.type,
      };
      if (values.dateRange) {
        params.startDate = dayjs(values.dateRange[0]).format('YYYY-MM-DD');
        params.endDate = dayjs(values.dateRange[1]).format('YYYY-MM-DD');
      }
      if (values.grade) params.grade = values.grade;
      if (values.department) params.department = values.department;
      if (values.classId) params.classId = values.classId;
      if (values.status) params.status = values.status;

      const response = await statisticsAPI.getCount(params);
      if (response.data.success) {
        setCountData(response.data.data);
      }
    } catch (error: any) {
      message.error('查询失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleTrendSearch = async (values: any) => {
    try {
      setLoading(true);
      const params: any = {
        type: values.type,
        groupBy: values.groupBy || 'day',
      };
      if (values.dateRange) {
        params.startDate = dayjs(values.dateRange[0]).format('YYYY-MM-DD');
        params.endDate = dayjs(values.dateRange[1]).format('YYYY-MM-DD');
      }

      const response = await statisticsAPI.getTrend(params);
      if (response.data.success) {
        setTrendData(response.data.data);
      }
    } catch (error: any) {
      message.error('查询失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleCompareSearch = async (values: any) => {
    try {
      setLoading(true);
      const params: any = {
        type: values.type,
      };
      if (values.period1) {
        params.period1Start = dayjs(values.period1[0]).format('YYYY-MM-DD');
        params.period1End = dayjs(values.period1[1]).format('YYYY-MM-DD');
      }
      if (values.period2) {
        params.period2Start = dayjs(values.period2[0]).format('YYYY-MM-DD');
        params.period2End = dayjs(values.period2[1]).format('YYYY-MM-DD');
      }
      if (values.grade) params.grade = values.grade;
      if (values.department) params.department = values.department;
      if (values.classId) params.classId = values.classId;

      const response = await statisticsAPI.getCompare(params);
      if (response.data.success) {
        setCompareData(response.data.data);
      }
    } catch (error: any) {
      message.error('查询失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const countColumns = [
    { title: '数量', dataIndex: 'count', key: 'count' },
    { title: '年级', dataIndex: 'grade', key: 'grade' },
    { title: '部门', dataIndex: 'department', key: 'department' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '优先级', dataIndex: 'priority', key: 'priority' },
    { title: '平均分', dataIndex: 'avg_score', key: 'avg_score', render: (val: number) => val ? val.toFixed(2) : '-' },
  ];

  const trendColumns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '数量', dataIndex: 'count', key: 'count' },
    { title: '出勤数', dataIndex: 'attendance_count', key: 'attendance_count' },
    { title: '缺勤数', dataIndex: 'absence_count', key: 'absence_count' },
    { title: '平均分', dataIndex: 'avg_score', key: 'avg_score', render: (val: number) => val ? val.toFixed(2) : '-' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>数据统计</h1>
      <Tabs defaultActiveKey="count">
        <TabPane tab="数量统计" key="count">
          <Card>
            <Form form={countForm} layout="inline" onFinish={handleCountSearch} style={{ marginBottom: 16 }}>
              <Form.Item name="type" label="统计类型" rules={[{ required: true }]}>
                <Select style={{ width: 150 }}>
                  <Option value="students">学生</Option>
                  <Option value="todos">待办事项</Option>
                  <Option value="attendance">考勤</Option>
                  <Option value="grades">成绩</Option>
                </Select>
              </Form.Item>
              <Form.Item name="dateRange" label="时间区间">
                <RangePicker />
              </Form.Item>
              <Form.Item name="grade" label="年级">
                <Input placeholder="例如：2023级" style={{ width: 150 }} />
              </Form.Item>
              <Form.Item name="department" label="部门">
                <Input placeholder="例如：计算机系" style={{ width: 150 }} />
              </Form.Item>
              <Form.Item name="status" label="状态">
                <Select style={{ width: 120 }} allowClear>
                  <Option value="在读">在读</Option>
                  <Option value="出勤">出勤</Option>
                  <Option value="待处理">待处理</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit" loading={loading}>
                  查询
                </Button>
              </Form.Item>
            </Form>
            <Table
              columns={countColumns}
              dataSource={countData}
              loading={loading}
              rowKey={(record, index) => index?.toString() || '0'}
              pagination={false}
            />
          </Card>
        </TabPane>
        <TabPane tab="趋势分析" key="trend">
          <Card>
            <Form form={trendForm} layout="inline" onFinish={handleTrendSearch} style={{ marginBottom: 16 }}>
              <Form.Item name="type" label="统计类型" rules={[{ required: true }]}>
                <Select style={{ width: 150 }}>
                  <Option value="students">学生</Option>
                  <Option value="todos">待办事项</Option>
                  <Option value="attendance">考勤</Option>
                  <Option value="grades">成绩</Option>
                </Select>
              </Form.Item>
              <Form.Item name="groupBy" label="分组方式">
                <Select defaultValue="day" style={{ width: 120 }}>
                  <Option value="day">按天</Option>
                  <Option value="week">按周</Option>
                  <Option value="month">按月</Option>
                  <Option value="year">按年</Option>
                </Select>
              </Form.Item>
              <Form.Item name="dateRange" label="时间区间">
                <RangePicker />
              </Form.Item>
              <Form.Item>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit" loading={loading}>
                  查询
                </Button>
              </Form.Item>
            </Form>
            <Table
              columns={trendColumns}
              dataSource={trendData}
              loading={loading}
              rowKey={(record, index) => index?.toString() || '0'}
              pagination={false}
            />
          </Card>
        </TabPane>
        <TabPane tab="数据对比" key="compare">
          <Card>
            <Form form={compareForm} layout="vertical" onFinish={handleCompareSearch} style={{ marginBottom: 16 }}>
              <Form.Item name="type" label="统计类型" rules={[{ required: true }]}>
                <Select style={{ width: 200 }}>
                  <Option value="students">学生</Option>
                  <Option value="attendance">考勤</Option>
                  <Option value="grades">成绩</Option>
                </Select>
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="period1" label="时间段1">
                    <RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="period2" label="时间段2">
                    <RangePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit" loading={loading}>
                  对比查询
                </Button>
              </Form.Item>
            </Form>
            {Object.keys(compareData).length > 0 && (
              <Row gutter={16}>
                <Col span={12}>
                  <Card>
                    <Statistic title="时间段1数量" value={compareData.period1_count || 0} />
                    {compareData.period1_avg && (
                      <Statistic title="时间段1平均分" value={parseFloat(compareData.period1_avg).toFixed(2)} suffix="分" style={{ marginTop: 16 }} />
                    )}
                    {compareData.period1_rate && (
                      <Statistic title="时间段1出勤率" value={parseFloat(compareData.period1_rate).toFixed(1)} suffix="%" style={{ marginTop: 16 }} />
                    )}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <Statistic title="时间段2数量" value={compareData.period2_count || 0} />
                    {compareData.period2_avg && (
                      <Statistic title="时间段2平均分" value={parseFloat(compareData.period2_avg).toFixed(2)} suffix="分" style={{ marginTop: 16 }} />
                    )}
                    {compareData.period2_rate && (
                      <Statistic title="时间段2出勤率" value={parseFloat(compareData.period2_rate).toFixed(1)} suffix="%" style={{ marginTop: 16 }} />
                    )}
                  </Card>
                </Col>
              </Row>
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Statistics;

