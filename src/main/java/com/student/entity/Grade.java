package com.student.entity;

import lombok.Data;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "grades")
@Data
public class Grade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "student_id", nullable = false)
    private Integer studentId;

    @Column(name = "class_id", nullable = false)
    private Integer classId;

    @Column(name = "course_name", nullable = false, length = 100)
    private String courseName;

    @Column(name = "exam_type", length = 50)
    private String examType;

    @Column(name = "score", precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "full_score", precision = 5, scale = 2, columnDefinition = "DECIMAL(5,2) DEFAULT 100")
    private BigDecimal fullScore = new BigDecimal("100");

    @Column(name = "semester", length = 20)
    private String semester;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(name = "exam_date")
    private LocalDate examDate;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


