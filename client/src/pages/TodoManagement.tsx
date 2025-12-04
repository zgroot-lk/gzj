import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, DatePicker, Space, message, Tag,
  Card, Row, Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { todoAPI } from '../utils/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const TodoManagement: React.FC = () => {
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async (params?: any) => {
    try {
      setLoading(true);
      const response = await todoAPI.getAll(params);
      if (response.data.success) {
        setTodos(response.data.data);
      }
    } catch (error: any) {
      message.error('加载数据失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values: any) => {
    const params: any = {};
    if (values.status) params.status = values.status;
    if (values.priority) params.priority = values.priority;
    if (values.startDate) params.startDate = dayjs(values.startDate).format('YYYY-MM-DD');
    if (values.endDate) params.endDate = dayjs(values.endDate).format('YYYY-MM-DD');
    if (values.assignee) params.assignee = values.assignee;
    loadTodos(params);
  };

  const handleAdd = () => {
    setEditingTodo(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingTodo(record);
    form.setFieldsValue({
      ...record,
      due_date: record.due_date ? dayjs(record.due_date) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条待办事项吗？',
      onOk: async () => {
        try {
          await todoAPI.delete(id);
          message.success('删除成功');
          loadTodos();
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
        due_date: values.due_date ? dayjs(values.due_date).format('YYYY-MM-DD') : null,
      };

      if (editingTodo) {
        await todoAPI.update(editingTodo.id, data);
        message.success('更新成功');
      } else {
        await todoAPI.create(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadTodos();
    } catch (error: any) {
      message.error('操作失败: ' + (error.message || '未知错误'));
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: any = {
          '待处理': 'default',
          '进行中': 'processing',
          '已完成': 'success',
          '已取消': 'error',
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colorMap: any = {
          '低': 'default',
          '中': 'blue',
          '高': 'orange',
          '紧急': 'red',
        };
        return <Tag color={colorMap[priority]}>{priority}</Tag>;
      },
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
    },
    {
      title: '截止日期',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
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
      <h1 style={{ marginBottom: 24 }}>待办事项管理</h1>
      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
              <Option value="待处理">待处理</Option>
              <Option value="进行中">进行中</Option>
              <Option value="已完成">已完成</Option>
              <Option value="已取消">已取消</Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select placeholder="请选择优先级" allowClear style={{ width: 120 }}>
              <Option value="低">低</Option>
              <Option value="中">中</Option>
              <Option value="高">高</Option>
              <Option value="紧急">紧急</Option>
            </Select>
          </Form.Item>
          <Form.Item name="startDate" label="开始日期">
            <DatePicker />
          </Form.Item>
          <Form.Item name="endDate" label="结束日期">
            <DatePicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => { searchForm.resetFields(); loadTodos(); }}>
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增待办
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={todos}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      <Modal
        title={editingTodo ? '编辑待办事项' : '新增待办事项'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={4} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select>
                  <Option value="待处理">待处理</Option>
                  <Option value="进行中">进行中</Option>
                  <Option value="已完成">已完成</Option>
                  <Option value="已取消">已取消</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
                <Select>
                  <Option value="低">低</Option>
                  <Option value="中">中</Option>
                  <Option value="高">高</Option>
                  <Option value="紧急">紧急</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="assignee" label="负责人">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="due_date" label="截止日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default TodoManagement;


