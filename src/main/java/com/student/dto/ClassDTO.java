package com.student.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 班级视图，字段命名与前端保持一致（下划线）
 */
@Data
public class ClassDTO {
    private Integer id;
    private String class_name;
    private String grade;
    private String department;
    private Integer teacher_id;
    private Integer student_count;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
}


