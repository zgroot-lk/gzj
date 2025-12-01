package com.student.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 考勤视图，包含学生与班级信息
 */
@Data
public class AttendanceDTO {
    private Integer id;
    private Integer student_id;
    private Integer class_id;
    private LocalDate attendance_date;
    private String status;
    private String course_name;
    private String remark;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    private String student_name;
    private String student_no;
    private String class_name;
    private String grade;
}


