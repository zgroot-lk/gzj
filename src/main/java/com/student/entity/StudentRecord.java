package com.student.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_records")
@Data
public class StudentRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "student_id", nullable = false)
    private Integer studentId;

    @Column(name = "id_card", length = 18)
    private String idCard;

    @Column(name = "nationality", length = 50)
    private String nationality = "中国";

    @Column(name = "ethnicity", length = 50)
    private String ethnicity;

    @Column(name = "political_status", length = 20)
    private String politicalStatus;

    @Column(name = "health_status", length = 50)
    private String healthStatus;

    @Column(name = "guardian_name", length = 50)
    private String guardianName;

    @Column(name = "guardian_phone", length = 20)
    private String guardianPhone;

    @Column(name = "previous_school", length = 100)
    private String previousSchool;

    @Enumerated(EnumType.STRING)
    @Column(name = "record_status", columnDefinition = "ENUM('正常', '转学', '休学', '退学') DEFAULT '正常'")
    private RecordStatus recordStatus = RecordStatus.正常;

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

    public enum RecordStatus {
        正常, 转学, 休学, 退学
    }
}


