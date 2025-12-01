const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 获取所有学生（支持多维度查询）
router.get('/', async (req, res) => {
  try {
    const { name, studentNo, classId, grade, department, status, startDate, endDate } = req.query;
    
    let sql = `SELECT s.*, c.class_name, c.grade, c.department 
               FROM students s 
               LEFT JOIN classes c ON s.class_id = c.id 
               WHERE 1=1`;
    const params = [];
    
    if (name) {
      sql += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (studentNo) {
      sql += ' AND s.student_no LIKE ?';
      params.push(`%${studentNo}%`);
    }
    if (classId) {
      sql += ' AND s.class_id = ?';
      params.push(classId);
    }
    if (grade) {
      sql += ' AND c.grade = ?';
      params.push(grade);
    }
    if (department) {
      sql += ' AND c.department = ?';
      params.push(department);
    }
    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }
    if (startDate) {
      sql += ' AND DATE(s.enrollment_date) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND DATE(s.enrollment_date) <= ?';
      params.push(endDate);
    }
    
    sql += ' ORDER BY s.created_at DESC';
    
    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单个学生
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.*, c.class_name, c.grade, c.department 
       FROM students s 
       LEFT JOIN classes c ON s.class_id = c.id 
       WHERE s.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '学生不存在' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建学生
router.post('/', async (req, res) => {
  try {
    const { student_no, name, gender, birth_date, phone, email, address, class_id, enrollment_date, status } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO students (student_no, name, gender, birth_date, phone, email, address, class_id, enrollment_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_no, name, gender, birth_date, phone, email, address, class_id, enrollment_date, status || '在读']
    );
    
    // 更新班级学生人数
    await pool.execute('UPDATE classes SET student_count = student_count + 1 WHERE id = ?', [class_id]);
    
    res.json({ success: true, data: { id: result.insertId }, message: '创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新学生
router.put('/:id', async (req, res) => {
  try {
    const { name, gender, birth_date, phone, email, address, class_id, enrollment_date, status } = req.body;
    
    // 获取原班级ID
    const [oldRows] = await pool.execute('SELECT class_id FROM students WHERE id = ?', [req.params.id]);
    const oldClassId = oldRows[0]?.class_id;
    
    const updateFields = [];
    const params = [];
    
    if (name !== undefined) { updateFields.push('name = ?'); params.push(name); }
    if (gender !== undefined) { updateFields.push('gender = ?'); params.push(gender); }
    if (birth_date !== undefined) { updateFields.push('birth_date = ?'); params.push(birth_date); }
    if (phone !== undefined) { updateFields.push('phone = ?'); params.push(phone); }
    if (email !== undefined) { updateFields.push('email = ?'); params.push(email); }
    if (address !== undefined) { updateFields.push('address = ?'); params.push(address); }
    if (class_id !== undefined) { updateFields.push('class_id = ?'); params.push(class_id); }
    if (enrollment_date !== undefined) { updateFields.push('enrollment_date = ?'); params.push(enrollment_date); }
    if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: '没有要更新的字段' });
    }
    
    params.push(req.params.id);
    
    await pool.execute(
      `UPDATE students SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
    
    // 如果班级变更，更新两个班级的学生人数
    if (class_id !== undefined && class_id !== oldClassId) {
      await pool.execute('UPDATE classes SET student_count = student_count - 1 WHERE id = ?', [oldClassId]);
      await pool.execute('UPDATE classes SET student_count = student_count + 1 WHERE id = ?', [class_id]);
    }
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除学生
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT class_id FROM students WHERE id = ?', [req.params.id]);
    const classId = rows[0]?.class_id;
    
    await pool.execute('DELETE FROM students WHERE id = ?', [req.params.id]);
    
    // 更新班级学生人数
    if (classId) {
      await pool.execute('UPDATE classes SET student_count = student_count - 1 WHERE id = ?', [classId]);
    }
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


