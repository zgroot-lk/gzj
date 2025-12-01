package com.student.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "todos")
@Data
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "ENUM('待处理', '进行中', '已完成', '已取消') DEFAULT '待处理'")
    private TodoStatus status = TodoStatus.待处理;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", columnDefinition = "ENUM('低', '中', '高', '紧急') DEFAULT '中'")
    private Priority priority = Priority.中;

    @Column(name = "assignee", length = 50)
    private String assignee;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "related_student_id")
    private Integer relatedStudentId;

    @Column(name = "related_class_id")
    private Integer relatedClassId;

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

    public enum TodoStatus {
        待处理, 进行中, 已完成, 已取消
    }

    public enum Priority {
        低, 中, 高, 紧急
    }
}


