const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 获取所有考勤记录（支持多维度查询）
router.get('/', async (req, res) => {
  try {
    const { studentId, classId, status, startDate, endDate, courseName } = req.query;
    
    let sql = `SELECT a.*, s.name as student_name, s.student_no, c.class_name, c.grade 
               FROM attendance a 
               LEFT JOIN students s ON a.student_id = s.id 
               LEFT JOIN classes c ON a.class_id = c.id 
               WHERE 1=1`;
    const params = [];
    
    if (studentId) {
      sql += ' AND a.student_id = ?';
      params.push(studentId);
    }
    if (classId) {
      sql += ' AND a.class_id = ?';
      params.push(classId);
    }
    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }
    if (startDate) {
      sql += ' AND DATE(a.attendance_date) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND DATE(a.attendance_date) <= ?';
      params.push(endDate);
    }
    if (courseName) {
      sql += ' AND a.course_name LIKE ?';
      params.push(`%${courseName}%`);
    }
    
    sql += ' ORDER BY a.attendance_date DESC, a.created_at DESC';
    
    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建考勤记录
router.post('/', async (req, res) => {
  try {
    const { student_id, class_id, attendance_date, status, course_name, remark } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO attendance (student_id, class_id, attendance_date, status, course_name, remark) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [student_id, class_id, attendance_date, status, course_name, remark]
    );
    
    res.json({ success: true, data: { id: result.insertId }, message: '创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新考勤记录
router.put('/:id', async (req, res) => {
  try {
    const { attendance_date, status, course_name, remark } = req.body;
    
    const updateFields = [];
    const params = [];
    
    if (attendance_date !== undefined) { updateFields.push('attendance_date = ?'); params.push(attendance_date); }
    if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }
    if (course_name !== undefined) { updateFields.push('course_name = ?'); params.push(course_name); }
    if (remark !== undefined) { updateFields.push('remark = ?'); params.push(remark); }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: '没有要更新的字段' });
    }
    
    params.push(req.params.id);
    
    await pool.execute(
      `UPDATE attendance SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除考勤记录
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM attendance WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


