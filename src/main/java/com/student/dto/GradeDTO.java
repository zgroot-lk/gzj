package com.student.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 成绩视图，包含学生与班级信息
 */
@Data
public class GradeDTO {
    private Integer id;
    private Integer student_id;
    private Integer class_id;
    private String course_name;
    private String exam_type;
    private BigDecimal score;
    private BigDecimal full_score;
    private String semester;
    private String academic_year;
    private LocalDate exam_date;
    private String remark;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    private String student_name;
    private String student_no;
    private String class_name;
    private String grade;
}


