import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Space, message, Card
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { gradeAPI, studentAPI, classAPI } from '../utils/api';
import dayjs from 'dayjs';

const { Option } = Select;

const GradeManagement: React.FC = () => {
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGrade, setEditingGrade] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadGrades();
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

  const loadGrades = async () => {
    try {
      setLoading(true);
      const response = await gradeAPI.getAll();
      if (response.data.success) {
        setGrades(response.data.data);
      }
    } catch (error: any) {
      message.error('加载数据失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingGrade(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingGrade(record);
    form.setFieldsValue({
      ...record,
      exam_date: record.exam_date ? dayjs(record.exam_date) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条成绩记录吗？',
      onOk: async () => {
        try {
          await gradeAPI.delete(id);
          message.success('删除成功');
          loadGrades();
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
        exam_date: values.exam_date ? dayjs(values.exam_date).format('YYYY-MM-DD') : null,
      };

      if (editingGrade) {
        await gradeAPI.update(editingGrade.id, data);
        message.success('更新成功');
      } else {
        await gradeAPI.create(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadGrades();
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
      title: '课程名称',
      dataIndex: 'course_name',
      key: 'course_name',
    },
    {
      title: '考试类型',
      dataIndex: 'exam_type',
      key: 'exam_type',
    },
    {
      title: '分数',
      dataIndex: 'score',
      key: 'score',
      render: (score: number, record: any) => `${score} / ${record.full_score}`,
    },
    {
      title: '学期',
      dataIndex: 'semester',
      key: 'semester',
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
      <h1 style={{ marginBottom: 24 }}>成绩管理</h1>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增成绩
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={grades}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      <Modal
        title={editingGrade ? '编辑成绩记录' : '新增成绩记录'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
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
          <Form.Item name="course_name" label="课程名称" rules={[{ required: true, message: '请输入课程名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="exam_type" label="考试类型">
            <Select>
              <Option value="平时">平时</Option>
              <Option value="期中">期中</Option>
              <Option value="期末">期末</Option>
            </Select>
          </Form.Item>
          <Form.Item name="score" label="分数" rules={[{ required: true, message: '请输入分数' }]}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="full_score" label="满分">
            <InputNumber min={0} defaultValue={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="semester" label="学期">
            <Input placeholder="例如：2023-2024-1" />
          </Form.Item>
          <Form.Item name="academic_year" label="学年">
            <Input placeholder="例如：2023-2024" />
          </Form.Item>
          <Form.Item name="exam_date" label="考试日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GradeManagement;


