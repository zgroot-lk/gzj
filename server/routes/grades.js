const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 获取所有成绩记录（支持多维度查询）
router.get('/', async (req, res) => {
  try {
    const { studentId, classId, courseName, semester, academicYear, startDate, endDate } = req.query;
    
    let sql = `SELECT g.*, s.name as student_name, s.student_no, c.class_name, c.grade 
               FROM grades g 
               LEFT JOIN students s ON g.student_id = s.id 
               LEFT JOIN classes c ON g.class_id = c.id 
               WHERE 1=1`;
    const params = [];
    
    if (studentId) {
      sql += ' AND g.student_id = ?';
      params.push(studentId);
    }
    if (classId) {
      sql += ' AND g.class_id = ?';
      params.push(classId);
    }
    if (courseName) {
      sql += ' AND g.course_name LIKE ?';
      params.push(`%${courseName}%`);
    }
    if (semester) {
      sql += ' AND g.semester = ?';
      params.push(semester);
    }
    if (academicYear) {
      sql += ' AND g.academic_year = ?';
      params.push(academicYear);
    }
    if (startDate) {
      sql += ' AND DATE(g.exam_date) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND DATE(g.exam_date) <= ?';
      params.push(endDate);
    }
    
    sql += ' ORDER BY g.exam_date DESC, g.created_at DESC';
    
    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建成绩记录
router.post('/', async (req, res) => {
  try {
    const { student_id, class_id, course_name, exam_type, score, full_score, semester, academic_year, exam_date, remark } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO grades (student_id, class_id, course_name, exam_type, score, full_score, semester, academic_year, exam_date, remark) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, class_id, course_name, exam_type, score, full_score || 100, semester, academic_year, exam_date, remark]
    );
    
    res.json({ success: true, data: { id: result.insertId }, message: '创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新成绩记录
router.put('/:id', async (req, res) => {
  try {
    const { course_name, exam_type, score, full_score, semester, academic_year, exam_date, remark } = req.body;
    
    const updateFields = [];
    const params = [];
    
    if (course_name !== undefined) { updateFields.push('course_name = ?'); params.push(course_name); }
    if (exam_type !== undefined) { updateFields.push('exam_type = ?'); params.push(exam_type); }
    if (score !== undefined) { updateFields.push('score = ?'); params.push(score); }
    if (full_score !== undefined) { updateFields.push('full_score = ?'); params.push(full_score); }
    if (semester !== undefined) { updateFields.push('semester = ?'); params.push(semester); }
    if (academic_year !== undefined) { updateFields.push('academic_year = ?'); params.push(academic_year); }
    if (exam_date !== undefined) { updateFields.push('exam_date = ?'); params.push(exam_date); }
    if (remark !== undefined) { updateFields.push('remark = ?'); params.push(remark); }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: '没有要更新的字段' });
    }
    
    params.push(req.params.id);
    
    await pool.execute(
      `UPDATE grades SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除成绩记录
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM grades WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


