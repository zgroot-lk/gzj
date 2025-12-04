import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, DatePicker, Space, message, Card, Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { attendanceAPI, studentAPI, classAPI } from '../utils/api';
import dayjs from 'dayjs';

const { Option } = Select;

const AttendanceManagement: React.FC = () => {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAttendances();
    loadStudents();
    loadClasses();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('加载学生失败', error);
    }
  };

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

  const loadAttendances = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getAll();
      if (response.data.success) {
        setAttendances(response.data.data);
      }
    } catch (error: any) {
      message.error('加载数据失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAttendance(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingAttendance(record);
    form.setFieldsValue({
      ...record,
      attendance_date: record.attendance_date ? dayjs(record.attendance_date) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条考勤记录吗？',
      onOk: async () => {
        try {
          await attendanceAPI.delete(id);
          message.success('删除成功');
          loadAttendances();
        } catch (error: any) {
          message.error('删除失败: ' + (error.message || '未知错误'));
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        attendance_date: values.attendance_date ? dayjs(values.attendance_date).format('YYYY-MM-DD') : null,
      };

      if (editingAttendance) {
        await attendanceAPI.update(editingAttendance.id, data);
        message.success('更新成功');
      } else {
        await attendanceAPI.create(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadAttendances();
    } catch (error: any) {
      message.error('操作失败: ' + (error.message || '未知错误'));
    }
  };

  const columns = [
    {
      title: '学生姓名',
      dataIndex: 'student_name',
      key: 'student_name',
    },
    {
      title: '学号',
      dataIndex: 'student_no',
      key: 'student_no',
    },
    {
      title: '班级',
      dataIndex: 'class_name',
      key: 'class_name',
    },
    {
      title: '考勤日期',
      dataIndex: 'attendance_date',
      key: 'attendance_date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: any = {
          '出勤': 'success',
          '迟到': 'warning',
          '早退': 'warning',
          '缺勤': 'error',
          '请假': 'default',
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: '课程',
      dataIndex: 'course_name',
      key: 'course_name',
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
      <h1 style={{ marginBottom: 24 }}>考勤管理</h1>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增考勤
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={attendances}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      <Modal
        title={editingAttendance ? '编辑考勤记录' : '新增考勤记录'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="student_id" label="学生" rules={[{ required: true, message: '请选择学生' }]}>
            <Select>
              {students.map((s: any) => (
                <Option key={s.id} value={s.id}>{s.name} ({s.student_no})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="class_id" label="班级" rules={[{ required: true, message: '请选择班级' }]}>
            <Select>
              {classes.map((c: any) => (
                <Option key={c.id} value={c.id}>{c.class_name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="attendance_date" label="考勤日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select>
              <Option value="出勤">出勤</Option>
              <Option value="迟到">迟到</Option>
              <Option value="早退">早退</Option>
              <Option value="缺勤">缺勤</Option>
              <Option value="请假">请假</Option>
            </Select>
          </Form.Item>
          <Form.Item name="course_name" label="课程名称">
            <Input />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttendanceManagement;


