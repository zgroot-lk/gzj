package com.student.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 学生列表视图，包含班级信息
 */
@Data
public class StudentWithClassDTO {
    private Integer id;
    private String student_no;
    private String name;
    private String gender;
    private LocalDate birth_date;
    private String phone;
    private String email;
    private String address;
    private Integer class_id;
    private String class_name;
    private String grade;
    private String department;
    private LocalDate enrollment_date;
    private String status;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
}


