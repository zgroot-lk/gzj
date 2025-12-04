import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, message, Card
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { recordAPI, studentAPI } from '../utils/api';

const { Option } = Select;

const RecordManagement: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadRecords();
    loadStudents();
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

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await recordAPI.getAll();
      if (response.data.success) {
        setRecords(response.data.data);
      }
    } catch (error: any) {
      message.error('加载数据失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条学籍信息吗？',
      onOk: async () => {
        try {
          await recordAPI.delete(id);
          message.success('删除成功');
          loadRecords();
        } catch (error: any) {
          message.error('删除失败: ' + (error.message || '未知错误'));
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        await recordAPI.update(editingRecord.id, values);
        message.success('更新成功');
      } else {
        await recordAPI.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadRecords();
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
      title: '身份证号',
      dataIndex: 'id_card',
      key: 'id_card',
    },
    {
      title: '民族',
      dataIndex: 'ethnicity',
      key: 'ethnicity',
    },
    {
      title: '政治面貌',
      dataIndex: 'political_status',
      key: 'political_status',
    },
    {
      title: '学籍状态',
      dataIndex: 'record_status',
      key: 'record_status',
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
      <h1 style={{ marginBottom: 24 }}>学籍管理</h1>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增学籍
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={records}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      <Modal
        title={editingRecord ? '编辑学籍信息' : '新增学籍信息'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="student_id" label="学生" rules={[{ required: true, message: '请选择学生' }]}>
            <Select disabled={!!editingRecord}>
              {students.map((s: any) => (
                <Option key={s.id} value={s.id}>{s.name} ({s.student_no})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="id_card" label="身份证号">
            <Input />
          </Form.Item>
          <Form.Item name="nationality" label="国籍">
            <Input defaultValue="中国" />
          </Form.Item>
          <Form.Item name="ethnicity" label="民族">
            <Input />
          </Form.Item>
          <Form.Item name="political_status" label="政治面貌">
            <Select>
              <Option value="群众">群众</Option>
              <Option value="团员">团员</Option>
              <Option value="党员">党员</Option>
            </Select>
          </Form.Item>
          <Form.Item name="health_status" label="健康状况">
            <Input />
          </Form.Item>
          <Form.Item name="guardian_name" label="监护人姓名">
            <Input />
          </Form.Item>
          <Form.Item name="guardian_phone" label="监护人电话">
            <Input />
          </Form.Item>
          <Form.Item name="previous_school" label="原毕业学校">
            <Input />
          </Form.Item>
          <Form.Item name="record_status" label="学籍状态">
            <Select>
              <Option value="正常">正常</Option>
              <Option value="转学">转学</Option>
              <Option value="休学">休学</Option>
              <Option value="退学">退学</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RecordManagement;


