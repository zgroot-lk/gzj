const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 获取所有待办事项（支持多维度查询）
router.get('/', async (req, res) => {
  try {
    const { status, priority, startDate, endDate, assignee, relatedStudentId, relatedClassId } = req.query;
    
    let sql = 'SELECT * FROM todos WHERE 1=1';
    const params = [];
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (priority) {
      sql += ' AND priority = ?';
      params.push(priority);
    }
    if (startDate) {
      sql += ' AND DATE(created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND DATE(created_at) <= ?';
      params.push(endDate);
    }
    if (assignee) {
      sql += ' AND assignee LIKE ?';
      params.push(`%${assignee}%`);
    }
    if (relatedStudentId) {
      sql += ' AND related_student_id = ?';
      params.push(relatedStudentId);
    }
    if (relatedClassId) {
      sql += ' AND related_class_id = ?';
      params.push(relatedClassId);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单个待办事项
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM todos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '待办事项不存在' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建待办事项
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, assignee, due_date, related_student_id, related_class_id } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO todos (title, description, status, priority, assignee, due_date, related_student_id, related_class_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, status || '待处理', priority || '中', assignee, due_date, related_student_id, related_class_id]
    );
    
    res.json({ success: true, data: { id: result.insertId }, message: '创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新待办事项
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, assignee, due_date, related_student_id, related_class_id, completed_at } = req.body;
    
    const updateFields = [];
    const params = [];
    
    if (title !== undefined) { updateFields.push('title = ?'); params.push(title); }
    if (description !== undefined) { updateFields.push('description = ?'); params.push(description); }
    if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }
    if (priority !== undefined) { updateFields.push('priority = ?'); params.push(priority); }
    if (assignee !== undefined) { updateFields.push('assignee = ?'); params.push(assignee); }
    if (due_date !== undefined) { updateFields.push('due_date = ?'); params.push(due_date); }
    if (related_student_id !== undefined) { updateFields.push('related_student_id = ?'); params.push(related_student_id); }
    if (related_class_id !== undefined) { updateFields.push('related_class_id = ?'); params.push(related_class_id); }
    if (completed_at !== undefined) { updateFields.push('completed_at = ?'); params.push(completed_at); }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: '没有要更新的字段' });
    }
    
    params.push(req.params.id);
    
    await pool.execute(
      `UPDATE todos SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除待办事项
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM todos WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


