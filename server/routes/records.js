const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 获取所有学籍信息（支持多维度查询）
router.get('/', async (req, res) => {
  try {
    const { studentId, recordStatus, startDate, endDate } = req.query;
    
    let sql = `SELECT sr.*, s.name as student_name, s.student_no, c.class_name, c.grade 
               FROM student_records sr 
               LEFT JOIN students s ON sr.student_id = s.id 
               LEFT JOIN classes c ON s.class_id = c.id 
               WHERE 1=1`;
    const params = [];
    
    if (studentId) {
      sql += ' AND sr.student_id = ?';
      params.push(studentId);
    }
    if (recordStatus) {
      sql += ' AND sr.record_status = ?';
      params.push(recordStatus);
    }
    if (startDate) {
      sql += ' AND DATE(sr.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND DATE(sr.created_at) <= ?';
      params.push(endDate);
    }
    
    sql += ' ORDER BY sr.created_at DESC';
    
    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单个学籍信息
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT sr.*, s.name as student_name, s.student_no, c.class_name, c.grade 
       FROM student_records sr 
       LEFT JOIN students s ON sr.student_id = s.id 
       LEFT JOIN classes c ON s.class_id = c.id 
       WHERE sr.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '学籍信息不存在' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 根据学生ID获取学籍信息
router.get('/student/:studentId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT sr.*, s.name as student_name, s.student_no, c.class_name, c.grade 
       FROM student_records sr 
       LEFT JOIN students s ON sr.student_id = s.id 
       LEFT JOIN classes c ON s.class_id = c.id 
       WHERE sr.student_id = ?`,
      [req.params.studentId]
    );
    res.json({ success: true, data: rows[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建学籍信息
router.post('/', async (req, res) => {
  try {
    const { student_id, id_card, nationality, ethnicity, political_status, health_status, 
            guardian_name, guardian_phone, previous_school, record_status } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO student_records (student_id, id_card, nationality, ethnicity, political_status, 
       health_status, guardian_name, guardian_phone, previous_school, record_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, id_card, nationality || '中国', ethnicity, political_status, health_status, 
       guardian_name, guardian_phone, previous_school, record_status || '正常']
    );
    
    res.json({ success: true, data: { id: result.insertId }, message: '创建成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新学籍信息
router.put('/:id', async (req, res) => {
  try {
    const { id_card, nationality, ethnicity, political_status, health_status, 
            guardian_name, guardian_phone, previous_school, record_status } = req.body;
    
    const updateFields = [];
    const params = [];
    
    if (id_card !== undefined) { updateFields.push('id_card = ?'); params.push(id_card); }
    if (nationality !== undefined) { updateFields.push('nationality = ?'); params.push(nationality); }
    if (ethnicity !== undefined) { updateFields.push('ethnicity = ?'); params.push(ethnicity); }
    if (political_status !== undefined) { updateFields.push('political_status = ?'); params.push(political_status); }
    if (health_status !== undefined) { updateFields.push('health_status = ?'); params.push(health_status); }
    if (guardian_name !== undefined) { updateFields.push('guardian_name = ?'); params.push(guardian_name); }
    if (guardian_phone !== undefined) { updateFields.push('guardian_phone = ?'); params.push(guardian_phone); }
    if (previous_school !== undefined) { updateFields.push('previous_school = ?'); params.push(previous_school); }
    if (record_status !== undefined) { updateFields.push('record_status = ?'); params.push(record_status); }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: '没有要更新的字段' });
    }
    
    params.push(req.params.id);
    
    await pool.execute(
      `UPDATE student_records SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除学籍信息
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM student_records WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


