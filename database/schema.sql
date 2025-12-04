-- 学生管理系统数据库表结构
-- 兼容 MySQL 8.0.44+

-- 设置字符集和排序规则
SET NAMES utf8mb4;

-- 设置 SQL 模式（兼容 MySQL 8.0.44）
SET sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- 禁用外键检查（创建表时，避免外键约束问题）
SET FOREIGN_KEY_CHECKS = 0;

-- 1. 班级信息表
CREATE TABLE IF NOT EXISTS classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_name VARCHAR(50) NOT NULL COMMENT '班级名称',
    grade VARCHAR(20) NOT NULL COMMENT '年级',
    department VARCHAR(50) COMMENT '部门/系别',
    teacher_id INT COMMENT '班主任ID',
    student_count INT DEFAULT 0 COMMENT '学生人数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_grade (grade),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='班级信息表';

-- 2. 学生基础信息表
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_no VARCHAR(20) UNIQUE NOT NULL COMMENT '学号',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender ENUM('男', '女') NOT NULL COMMENT '性别',
    birth_date DATE COMMENT '出生日期',
    phone VARCHAR(20) COMMENT '联系电话',
    email VARCHAR(100) COMMENT '邮箱',
    address TEXT COMMENT '家庭地址',
    class_id INT NOT NULL COMMENT '班级ID',
    enrollment_date DATE COMMENT '入学日期',
    status ENUM('在读', '休学', '退学', '毕业') DEFAULT '在读' COMMENT '状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT,
    INDEX idx_student_no (student_no),
    INDEX idx_class_id (class_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生基础信息表';

-- 3. 学籍信息表
CREATE TABLE IF NOT EXISTS student_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL COMMENT '学生ID',
    id_card VARCHAR(18) COMMENT '身份证号',
    nationality VARCHAR(50) DEFAULT '中国' COMMENT '国籍',
    ethnicity VARCHAR(50) COMMENT '民族',
    political_status VARCHAR(20) COMMENT '政治面貌',
    health_status VARCHAR(50) COMMENT '健康状况',
    guardian_name VARCHAR(50) COMMENT '监护人姓名',
    guardian_phone VARCHAR(20) COMMENT '监护人电话',
    previous_school VARCHAR(100) COMMENT '原毕业学校',
    record_status ENUM('正常', '转学', '休学', '退学') DEFAULT '正常' COMMENT '学籍状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_record_status (record_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学籍信息表';

-- 4. 课表信息表
CREATE TABLE IF NOT EXISTS schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL COMMENT '班级ID',
    course_name VARCHAR(100) NOT NULL COMMENT '课程名称',
    teacher_name VARCHAR(50) COMMENT '授课教师',
    day_of_week INT NOT NULL COMMENT '星期几 (1-7)',
    start_time TIME NOT NULL COMMENT '开始时间',
    end_time TIME NOT NULL COMMENT '结束时间',
    classroom VARCHAR(50) COMMENT '教室',
    semester VARCHAR(20) COMMENT '学期',
    academic_year VARCHAR(20) COMMENT '学年',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_class_id (class_id),
    INDEX idx_semester (semester),
    INDEX idx_academic_year (academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课表信息表';

-- 5. 考勤信息表
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL COMMENT '学生ID',
    class_id INT NOT NULL COMMENT '班级ID',
    attendance_date DATE NOT NULL COMMENT '考勤日期',
    status ENUM('出勤', '迟到', '早退', '缺勤', '请假') NOT NULL COMMENT '考勤状态',
    course_name VARCHAR(100) COMMENT '课程名称',
    remark TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_class_id (class_id),
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考勤信息表';

-- 6. 成绩信息表
CREATE TABLE IF NOT EXISTS grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL COMMENT '学生ID',
    class_id INT NOT NULL COMMENT '班级ID',
    course_name VARCHAR(100) NOT NULL COMMENT '课程名称',
    exam_type VARCHAR(50) COMMENT '考试类型 (期中/期末/平时)',
    score DECIMAL(5,2) COMMENT '分数',
    full_score DECIMAL(5,2) DEFAULT 100 COMMENT '满分',
    semester VARCHAR(20) COMMENT '学期',
    academic_year VARCHAR(20) COMMENT '学年',
    exam_date DATE COMMENT '考试日期',
    remark TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_class_id (class_id),
    INDEX idx_semester (semester),
    INDEX idx_academic_year (academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成绩信息表';

-- 7. 待办事项表
CREATE TABLE IF NOT EXISTS todos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '待办标题',
    description TEXT COMMENT '待办描述',
    status ENUM('待处理', '进行中', '已完成', '已取消') DEFAULT '待处理' COMMENT '状态',
    priority ENUM('低', '中', '高', '紧急') DEFAULT '中' COMMENT '优先级',
    assignee VARCHAR(50) COMMENT '负责人',
    due_date DATE COMMENT '截止日期',
    completed_at DATETIME NULL COMMENT '完成时间',
    related_student_id INT COMMENT '关联学生ID',
    related_class_id INT COMMENT '关联班级ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (related_student_id) REFERENCES students(id) ON DELETE SET NULL,
    FOREIGN KEY (related_class_id) REFERENCES classes(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_due_date (due_date),
    INDEX idx_related_student_id (related_student_id),
    INDEX idx_related_class_id (related_class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='待办事项表';

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

