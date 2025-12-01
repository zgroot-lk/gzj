const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 获取所有课表（支持多维度查询）
router.get('/', async (req, res) => {
  try {
    const { classId, semester, academicYear, dayOfWeek } = req.query;
    
    let sql = `SELECT s.*, c.class_name, c.grade, c.department 
               FROM schedules s 
               LEFT JOIN classes c ON s.class_id = c.id 
               WHERE 1=1`;
    const params = [];
    
    if (classId) {
      sql += ' AND s.class_id = ?';
      params.push(classId);
    }
    if (semester) {
      sql += ' AND s.semester = ?';
      params.push(semester);
    }
    if (academicYear) {
      sql += ' AND s.academic_year = ?';
      params.push(academicYear);
    }
    if (dayOfWeek) {
      sql += ' AND s.day_of_week = ?';
      params.push(dayOfWeek);
    }
    
    sql += ' ORDER BY s.day_of_week, s.start_time';
    
    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建课表
router.post('/', async (req, res) => {
  try {
    const { class_id, course_name, teacher_name, day_of_week, start_time, end_time, classroom, semester, academic_year } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO schedules (class_id, course_name, teacher_name, day_of_week, start_time, end_time, classroom, semester, academic_year) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [class_id, course_name, teacher_name, day_of_week, start_time, end_time, classroom, semester, academic_year]
    );
    
    res.json({ success: true, data: { id: result.insertId }, message: '创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新课表
router.put('/:id', async (req, res) => {
  try {
    const { course_name, teacher_name, day_of_week, start_time, end_time, classroom, semester, academic_year } = req.body;
    
    const updateFields = [];
    const params = [];
    
    if (course_name !== undefined) { updateFields.push('course_name = ?'); params.push(course_name); }
    if (teacher_name !== undefined) { updateFields.push('teacher_name = ?'); params.push(teacher_name); }
    if (day_of_week !== undefined) { updateFields.push('day_of_week = ?'); params.push(day_of_week); }
    if (start_time !== undefined) { updateFields.push('start_time = ?'); params.push(start_time); }
    if (end_time !== undefined) { updateFields.push('end_time = ?'); params.push(end_time); }
    if (classroom !== undefined) { updateFields.push('classroom = ?'); params.push(classroom); }
    if (semester !== undefined) { updateFields.push('semester = ?'); params.push(semester); }
    if (academic_year !== undefined) { updateFields.push('academic_year = ?'); params.push(academic_year); }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: '没有要更新的字段' });
    }
    
    params.push(req.params.id);
    
    await pool.execute(
      `UPDATE schedules SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除课表
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM schedules WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


