package com.student.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 课表视图，包含班级信息
 */
@Data
public class ScheduleDTO {
    private Integer id;
    private Integer class_id;
    private String course_name;
    private String teacher_name;
    private Integer day_of_week;
    private LocalTime start_time;
    private LocalTime end_time;
    private String classroom;
    private String semester;
    private String academic_year;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    private String class_name;
    private String grade;
    private String department;
}


