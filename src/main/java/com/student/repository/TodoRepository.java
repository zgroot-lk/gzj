package com.student.repository;

import com.student.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Integer> {
    List<Todo> findByStatus(Todo.TodoStatus status);
    List<Todo> findByPriority(Todo.Priority priority);
    List<Todo> findByAssigneeContaining(String assignee);
    List<Todo> findByRelatedStudentId(Integer studentId);
    List<Todo> findByRelatedClassId(Integer classId);
    
    @Query("SELECT t FROM Todo t WHERE DATE(t.createdAt) >= :startDate AND DATE(t.createdAt) <= :endDate")
    List<Todo> findByCreatedAtBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}


