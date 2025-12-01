const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 获取所有班级（支持多维度查询）
router.get('/', async (req, res) => {
  try {
    const { grade, department, className } = req.query;
    
    let sql = 'SELECT * FROM classes WHERE 1=1';
    const params = [];
    
    if (grade) {
      sql += ' AND grade = ?';
      params.push(grade);
    }
    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }
    if (className) {
      sql += ' AND class_name LIKE ?';
      params.push(`%${className}%`);
    }
    
    sql += ' ORDER BY grade, class_name';
    
    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单个班级
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM classes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '班级不存在' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建班级
router.post('/', async (req, res) => {
  try {
    const { class_name, grade, department, teacher_id } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO classes (class_name, grade, department, teacher_id) VALUES (?, ?, ?, ?)',
      [class_name, grade, department, teacher_id]
    );
    
    res.json({ success: true, data: { id: result.insertId }, message: '创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新班级
router.put('/:id', async (req, res) => {
  try {
    const { class_name, grade, department, teacher_id } = req.body;
    
    const updateFields = [];
    const params = [];
    
    if (class_name !== undefined) { updateFields.push('class_name = ?'); params.push(class_name); }
    if (grade !== undefined) { updateFields.push('grade = ?'); params.push(grade); }
    if (department !== undefined) { updateFields.push('department = ?'); params.push(department); }
    if (teacher_id !== undefined) { updateFields.push('teacher_id = ?'); params.push(teacher_id); }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: '没有要更新的字段' });
    }
    
    params.push(req.params.id);
    
    await pool.execute(
      `UPDATE classes SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除班级
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM classes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


