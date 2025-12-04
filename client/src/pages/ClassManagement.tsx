import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, message, Card
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { classAPI } from '../utils/api';

const { Option } = Select;

const ClassManagement: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async (params?: any) => {
    try {
      setLoading(true);
      const response = await classAPI.getAll(params);
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error: any) {
      message.error('加载数据失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingClass(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingClass(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个班级吗？',
      onOk: async () => {
        try {
          await classAPI.delete(id);
          message.success('删除成功');
          loadClasses();
        } catch (error: any) {
          message.error('删除失败: ' + (error.message || '未知错误'));
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingClass) {
        await classAPI.update(editingClass.id, values);
        message.success('更新成功');
      } else {
        await classAPI.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadClasses();
    } catch (error: any) {
      message.error('操作失败: ' + (error.message || '未知错误'));
    }
  };

  const columns = [
    {
      title: '班级名称',
      dataIndex: 'class_name',
      key: 'class_name',
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '学生人数',
      dataIndex: 'student_count',
      key: 'student_count',
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
      <h1 style={{ marginBottom: 24 }}>班级管理</h1>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增班级
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={classes}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      <Modal
        title={editingClass ? '编辑班级' : '新增班级'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="class_name" label="班级名称" rules={[{ required: true, message: '请输入班级名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="grade" label="年级" rules={[{ required: true, message: '请输入年级' }]}>
            <Input placeholder="例如：2023级" />
          </Form.Item>
          <Form.Item name="department" label="部门">
            <Input placeholder="例如：计算机系" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassManagement;


