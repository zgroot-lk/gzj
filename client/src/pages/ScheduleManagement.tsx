import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, InputNumber, Space, message, Card
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { scheduleAPI, classAPI } from '../utils/api';

const { Option } = Select;

const ScheduleManagement: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadSchedules();
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await classAPI.getAll();
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error('加载班级失败', error);
    }
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await scheduleAPI.getAll();
      if (response.data.success) {
        setSchedules(response.data.data);
      }
    } catch (error: any) {
      message.error('加载数据失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSchedule(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingSchedule(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条课表记录吗？',
      onOk: async () => {
        try {
          await scheduleAPI.delete(id);
          message.success('删除成功');
          loadSchedules();
        } catch (error: any) {
          message.error('删除失败: ' + (error.message || '未知错误'));
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingSchedule) {
        await scheduleAPI.update(editingSchedule.id, values);
        message.success('更新成功');
      } else {
        await scheduleAPI.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadSchedules();
    } catch (error: any) {
      message.error('操作失败: ' + (error.message || '未知错误'));
    }
  };

  const dayNames = ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

  const columns = [
    {
      title: '班级',
      dataIndex: 'class_name',
      key: 'class_name',
    },
    {
      title: '课程名称',
      dataIndex: 'course_name',
      key: 'course_name',
    },
    {
      title: '授课教师',
      dataIndex: 'teacher_name',
      key: 'teacher_name',
    },
    {
      title: '星期',
      dataIndex: 'day_of_week',
      key: 'day_of_week',
      render: (day: number) => dayNames[day] || day,
    },
    {
      title: '时间',
      key: 'time',
      render: (_: any, record: any) => `${record.start_time} - ${record.end_time}`,
    },
    {
      title: '教室',
      dataIndex: 'classroom',
      key: 'classroom',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>课表管理</h1>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增课表
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={schedules}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      <Modal
        title={editingSchedule ? '编辑课表' : '新增课表'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="class_id" label="班级" rules={[{ required: true, message: '请选择班级' }]}>
            <Select>
              {classes.map((c: any) => (
                <Option key={c.id} value={c.id}>{c.class_name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="course_name" label="课程名称" rules={[{ required: true, message: '请输入课程名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="teacher_name" label="授课教师">
            <Input />
          </Form.Item>
          <Form.Item name="day_of_week" label="星期" rules={[{ required: true, message: '请选择星期' }]}>
            <Select>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <Option key={day} value={day}>{dayNames[day]}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="start_time" label="开始时间" rules={[{ required: true, message: '请输入开始时间' }]}>
            <Input placeholder="例如：08:00:00" />
          </Form.Item>
          <Form.Item name="end_time" label="结束时间" rules={[{ required: true, message: '请输入结束时间' }]}>
            <Input placeholder="例如：09:40:00" />
          </Form.Item>
          <Form.Item name="classroom" label="教室">
            <Input />
          </Form.Item>
          <Form.Item name="semester" label="学期">
            <Input placeholder="例如：2023-2024-1" />
          </Form.Item>
          <Form.Item name="academic_year" label="学年">
            <Input placeholder="例如：2023-2024" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScheduleManagement;


