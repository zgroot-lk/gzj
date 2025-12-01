package com.student.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 学籍视图，包含学生与班级信息
 */
@Data
public class StudentRecordDTO {
    private Integer id;
    private Integer student_id;
    private String id_card;
    private String nationality;
    private String ethnicity;
    private String political_status;
    private String health_status;
    private String guardian_name;
    private String guardian_phone;
    private String previous_school;
    private String record_status;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    private String student_name;
    private String student_no;
    private String class_name;
    private String grade;
}


