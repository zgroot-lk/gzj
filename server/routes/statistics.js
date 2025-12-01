const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 按时间区间、部门年级班级、状态的数量统计
router.get('/count', async (req, res) => {
  try {
    const { type, startDate, endDate, grade, department, classId, status } = req.query;
    
    let sql = '';
    const params = [];
    let whereClause = 'WHERE 1=1';
    
    // 根据类型选择不同的表
    switch (type) {
      case 'students':
        sql = `SELECT COUNT(*) as count, 
                      COALESCE(c.grade, '未知') as grade, 
                      COALESCE(c.department, '未知') as department,
                      COALESCE(s.status, '未知') as status
               FROM students s 
               LEFT JOIN classes c ON s.class_id = c.id`;
        if (startDate) {
          whereClause += ' AND DATE(s.enrollment_date) >= ?';
          params.push(startDate);
        }
        if (endDate) {
          whereClause += ' AND DATE(s.enrollment_date) <= ?';
          params.push(endDate);
        }
        if (grade) {
          whereClause += ' AND c.grade = ?';
          params.push(grade);
        }
        if (department) {
          whereClause += ' AND c.department = ?';
          params.push(department);
        }
        if (classId) {
          whereClause += ' AND s.class_id = ?';
          params.push(classId);
        }
        if (status) {
          whereClause += ' AND s.status = ?';
          params.push(status);
        }
        sql += ' ' + whereClause + ' GROUP BY c.grade, c.department, s.status';
        break;
        
      case 'todos':
        sql = `SELECT COUNT(*) as count, status, priority 
               FROM todos`;
        if (startDate) {
          whereClause += ' AND DATE(created_at) >= ?';
          params.push(startDate);
        }
        if (endDate) {
          whereClause += ' AND DATE(created_at) <= ?';
          params.push(endDate);
        }
        if (status) {
          whereClause += ' AND status = ?';
          params.push(status);
        }
        sql += ' ' + whereClause + ' GROUP BY status, priority';
        break;
        
      case 'attendance':
        sql = `SELECT COUNT(*) as count, a.status, 
                      COALESCE(c.grade, '未知') as grade,
                      COALESCE(c.department, '未知') as department
               FROM attendance a 
               LEFT JOIN classes c ON a.class_id = c.id`;
        if (startDate) {
          whereClause += ' AND DATE(a.attendance_date) >= ?';
          params.push(startDate);
        }
        if (endDate) {
          whereClause += ' AND DATE(a.attendance_date) <= ?';
          params.push(endDate);
        }
        if (grade) {
          whereClause += ' AND c.grade = ?';
          params.push(grade);
        }
        if (department) {
          whereClause += ' AND c.department = ?';
          params.push(department);
        }
        if (classId) {
          whereClause += ' AND a.class_id = ?';
          params.push(classId);
        }
        if (status) {
          whereClause += ' AND a.status = ?';
          params.push(status);
        }
        sql += ' ' + whereClause + ' GROUP BY a.status, c.grade, c.department';
        break;
        
      case 'grades':
        sql = `SELECT COUNT(*) as count, 
                      AVG(g.score) as avg_score,
                      COALESCE(c.grade, '未知') as grade,
                      COALESCE(c.department, '未知') as department
               FROM grades g 
               LEFT JOIN classes c ON g.class_id = c.id`;
        if (startDate) {
          whereClause += ' AND DATE(g.exam_date) >= ?';
          params.push(startDate);
        }
        if (endDate) {
          whereClause += ' AND DATE(g.exam_date) <= ?';
          params.push(endDate);
        }
        if (grade) {
          whereClause += ' AND c.grade = ?';
          params.push(grade);
        }
        if (department) {
          whereClause += ' AND c.department = ?';
          params.push(department);
        }
        if (classId) {
          whereClause += ' AND g.class_id = ?';
          params.push(classId);
        }
        sql += ' ' + whereClause + ' GROUP BY c.grade, c.department';
        break;
        
      default:
        return res.status(400).json({ success: false, message: '无效的统计类型' });
    }
    
    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 增量统计（趋势分析）
router.get('/trend', async (req, res) => {
  try {
    const { type, startDate, endDate, groupBy = 'day' } = req.query;
    
    let sql = '';
    const params = [];
    let dateFormat = '';
    
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }
    
    switch (type) {
      case 'students':
        sql = `SELECT DATE_FORMAT(enrollment_date, ?) as date, COUNT(*) as count 
               FROM students 
               WHERE enrollment_date >= ? AND enrollment_date <= ?
               GROUP BY DATE_FORMAT(enrollment_date, ?)
               ORDER BY date`;
        params.push(dateFormat, startDate || '2020-01-01', endDate || '2030-12-31', dateFormat);
        break;
        
      case 'todos':
        sql = `SELECT DATE_FORMAT(created_at, ?) as date, COUNT(*) as count 
               FROM todos 
               WHERE created_at >= ? AND created_at <= ?
               GROUP BY DATE_FORMAT(created_at, ?)
               ORDER BY date`;
        params.push(dateFormat, startDate || '2020-01-01', endDate || '2030-12-31', dateFormat);
        break;
        
      case 'attendance':
        sql = `SELECT DATE_FORMAT(attendance_date, ?) as date, COUNT(*) as count,
                      SUM(CASE WHEN status = '出勤' THEN 1 ELSE 0 END) as attendance_count,
                      SUM(CASE WHEN status = '缺勤' THEN 1 ELSE 0 END) as absence_count
               FROM attendance 
               WHERE attendance_date >= ? AND attendance_date <= ?
               GROUP BY DATE_FORMAT(attendance_date, ?)
               ORDER BY date`;
        params.push(dateFormat, startDate || '2020-01-01', endDate || '2030-12-31', dateFormat);
        break;
        
      case 'grades':
        sql = `SELECT DATE_FORMAT(exam_date, ?) as date, COUNT(*) as count, AVG(score) as avg_score
               FROM grades 
               WHERE exam_date >= ? AND exam_date <= ?
               GROUP BY DATE_FORMAT(exam_date, ?)
               ORDER BY date`;
        params.push(dateFormat, startDate || '2020-01-01', endDate || '2030-12-31', dateFormat);
        break;
        
      default:
        return res.status(400).json({ success: false, message: '无效的统计类型' });
    }
    
    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 数据对比
router.get('/compare', async (req, res) => {
  try {
    const { type, period1Start, period1End, period2Start, period2End, grade, department, classId } = req.query;
    
    let sql = '';
    const params = [];
    
    switch (type) {
      case 'students':
        sql = `SELECT 
                 (SELECT COUNT(*) FROM students s 
                  LEFT JOIN classes c ON s.class_id = c.id 
                  WHERE DATE(s.enrollment_date) >= ? AND DATE(s.enrollment_date) <= ?
                  ${grade ? 'AND c.grade = ?' : ''}
                  ${department ? 'AND c.department = ?' : ''}
                  ${classId ? 'AND s.class_id = ?' : ''}) as period1_count,
                 (SELECT COUNT(*) FROM students s 
                  LEFT JOIN classes c ON s.class_id = c.id 
                  WHERE DATE(s.enrollment_date) >= ? AND DATE(s.enrollment_date) <= ?
                  ${grade ? 'AND c.grade = ?' : ''}
                  ${department ? 'AND c.department = ?' : ''}
                  ${classId ? 'AND s.class_id = ?' : ''}) as period2_count`;
        if (grade) params.push(grade);
        if (department) params.push(department);
        if (classId) params.push(classId);
        params.push(period1Start, period1End);
        if (grade) params.push(grade);
        if (department) params.push(department);
        if (classId) params.push(classId);
        params.push(period2Start, period2End);
        break;
        
      case 'attendance':
        sql = `SELECT 
                 (SELECT COUNT(*) FROM attendance a 
                  LEFT JOIN classes c ON a.class_id = c.id 
                  WHERE DATE(a.attendance_date) >= ? AND DATE(a.attendance_date) <= ?
                  ${grade ? 'AND c.grade = ?' : ''}
                  ${department ? 'AND c.department = ?' : ''}
                  ${classId ? 'AND a.class_id = ?' : ''}) as period1_count,
                 (SELECT AVG(CASE WHEN a.status = '出勤' THEN 1 ELSE 0 END) * 100 FROM attendance a 
                  LEFT JOIN classes c ON a.class_id = c.id 
                  WHERE DATE(a.attendance_date) >= ? AND DATE(a.attendance_date) <= ?
                  ${grade ? 'AND c.grade = ?' : ''}
                  ${department ? 'AND c.department = ?' : ''}
                  ${classId ? 'AND a.class_id = ?' : ''}) as period1_rate,
                 (SELECT COUNT(*) FROM attendance a 
                  LEFT JOIN classes c ON a.class_id = c.id 
                  WHERE DATE(a.attendance_date) >= ? AND DATE(a.attendance_date) <= ?
                  ${grade ? 'AND c.grade = ?' : ''}
                  ${department ? 'AND c.department = ?' : ''}
                  ${classId ? 'AND a.class_id = ?' : ''}) as period2_count,
                 (SELECT AVG(CASE WHEN a.status = '出勤' THEN 1 ELSE 0 END) * 100 FROM attendance a 
                  LEFT JOIN classes c ON a.class_id = c.id 
                  WHERE DATE(a.attendance_date) >= ? AND DATE(a.attendance_date) <= ?
                  ${grade ? 'AND c.grade = ?' : ''}
                  ${department ? 'AND c.department = ?' : ''}
                  ${classId ? 'AND a.class_id = ?' : ''}) as period2_rate`;
        if (grade) params.push(grade);
        if (department) params.push(department);
        if (classId) params.push(classId);
        params.push(period1Start, period1End);
        if (grade) params.push(grade);
        if (department) params.push(department);
        if (classId) params.push(classId);
        params.push(period1Start, period1End);
        if (grade) params.push(grade);
        if (department) params.push(department);
        if (classId) params.push(classId);
        params.push(period2Start, period2End);
        if (grade) params.push(grade);
        if (department) params.push(department);
        if (classId) params.push(classId);
        params.push(period2Start, period2End);
        break;
        
      case 'grades':
        sql = `SELECT 
                 (SELECT AVG(score) FROM grades g 
                  LEFT JOIN classes c ON g.class_id = c.id 
                  WHERE DATE(g.exam_date) >= ? AND DATE(g.exam_date) <= ?
                  ${grade ? 'AND c.grade = ?' : ''}
                  ${department ? 'AND c.department = ?' : ''}
                  ${classId ? 'AND g.class_id = ?' : ''}) as period1_avg,
                 (SELECT AVG(score) FROM grades g 
                  LEFT JOIN classes c ON g.class_id = c.id 
                  WHERE DATE(g.exam_date) >= ? AND DATE(g.exam_date) <= ?
                  ${grade ? 'AND c.grade = ?' : ''}
                  ${department ? 'AND c.department = ?' : ''}
                  ${classId ? 'AND g.class_id = ?' : ''}) as period2_avg`;
        if (grade) params.push(grade);
        if (department) params.push(department);
        if (classId) params.push(classId);
        params.push(period1Start, period1End);
        if (grade) params.push(grade);
        if (department) params.push(department);
        if (classId) params.push(classId);
        params.push(period2Start, period2End);
        break;
        
      default:
        return res.status(400).json({ success: false, message: '无效的统计类型' });
    }
    
    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 综合统计概览
router.get('/overview', async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT COUNT(*) as total FROM students');
    const [classes] = await pool.execute('SELECT COUNT(*) as total FROM classes');
    const [todos] = await pool.execute('SELECT COUNT(*) as total, status FROM todos GROUP BY status');
    const [attendance] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = '出勤' THEN 1 ELSE 0 END) as attendance_count,
        SUM(CASE WHEN status = '缺勤' THEN 1 ELSE 0 END) as absence_count
      FROM attendance
    `);
    const [grades] = await pool.execute('SELECT COUNT(*) as total, AVG(score) as avg_score FROM grades');
    
    res.json({
      success: true,
      data: {
        students: students[0]?.total || 0,
        classes: classes[0]?.total || 0,
        todos: todos,
        attendance: attendance[0] || {},
        grades: grades[0] || {}
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


