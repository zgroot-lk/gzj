import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, DatePicker, Space, message, Tag,
  Card, Row, Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { studentAPI, classAPI } from '../utils/api';
import dayjs from 'dayjs';

const { Option } = Select;

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  useEffect(() => {
    loadStudents();
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

  const loadStudents = async (params?: any) => {
    try {
      setLoading(true);
      const response = await studentAPI.getAll(params);
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error: any) {
      message.error('加载数据失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values: any) => {
    const params: any = {};
    if (values.name) params.name = values.name;
    if (values.studentNo) params.studentNo = values.studentNo;
    if (values.classId) params.classId = values.classId;
    if (values.grade) params.grade = values.grade;
    if (values.department) params.department = values.department;
    if (values.status) params.status = values.status;
    if (values.startDate) params.startDate = dayjs(values.startDate).format('YYYY-MM-DD');
    if (values.endDate) params.endDate = dayjs(values.endDate).format('YYYY-MM-DD');
    loadStudents(params);
  };

  const handleAdd = () => {
    setEditingStudent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingStudent(record);
    form.setFieldsValue({
      ...record,
      birth_date: record.birth_date ? dayjs(record.birth_date) : null,
      enrollment_date: record.enrollment_date ? dayjs(record.enrollment_date) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个学生吗？',
      onOk: async () => {
        try {
          await studentAPI.delete(id);
          message.success('删除成功');
          loadStudents();
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
        birth_date: values.birth_date ? dayjs(values.birth_date).format('YYYY-MM-DD') : null,
        enrollment_date: values.enrollment_date ? dayjs(values.enrollment_date).format('YYYY-MM-DD') : null,
      };

      if (editingStudent) {
        await studentAPI.update(editingStudent.id, data);
        message.success('更新成功');
      } else {
        await studentAPI.create(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadStudents();
    } catch (error: any) {
      message.error('操作失败: ' + (error.message || '未知错误'));
    }
  };

  const columns = [
    {
      title: '学号',
      dataIndex: 'student_no',
      key: 'student_no',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: '班级',
      dataIndex: 'class_name',
      key: 'class_name',
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: any = {
          '在读': 'success',
          '休学': 'warning',
          '退学': 'error',
          '毕业': 'default',
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
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

  const uniqueGrades = Array.from(new Set(classes.map((c: any) => c.grade)));
  const uniqueDepartments = Array.from(new Set(classes.map((c: any) => c.department)));

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>学生管理</h1>
      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="name" label="姓名">
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="studentNo" label="学号">
            <Input placeholder="请输入学号" />
          </Form.Item>
          <Form.Item name="classId" label="班级">
            <Select placeholder="请选择班级" allowClear style={{ width: 150 }}>
              {classes.map((c: any) => (
                <Option key={c.id} value={c.id}>{c.class_name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="grade" label="年级">
            <Select placeholder="请选择年级" allowClear style={{ width: 120 }}>
              {uniqueGrades.map((g: string) => (
                <Option key={g} value={g}>{g}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
              <Option value="在读">在读</Option>
              <Option value="休学">休学</Option>
              <Option value="退学">退学</Option>
              <Option value="毕业">毕业</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => { searchForm.resetFields(); loadStudents(); }}>
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增学生
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={students}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      <Modal
        title={editingStudent ? '编辑学生' : '新增学生'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="student_no" label="学号" rules={[{ required: true, message: '请输入学号' }]}>
                <Input disabled={!!editingStudent} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gender" label="性别" rules={[{ required: true }]}>
                <Select>
                  <Option value="男">男</Option>
                  <Option value="女">女</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="birth_date" label="出生日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="联系电话">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="邮箱">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="家庭地址">
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="class_id" label="班级" rules={[{ required: true, message: '请选择班级' }]}>
                <Select>
                  {classes.map((c: any) => (
                    <Option key={c.id} value={c.id}>{c.class_name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="enrollment_date" label="入学日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select>
              <Option value="在读">在读</Option>
              <Option value="休学">休学</Option>
              <Option value="退学">退学</Option>
              <Option value="毕业">毕业</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentManagement;


