package com.student.repository;

import com.student.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Integer> {
    List<Grade> findByStudentId(Integer studentId);
    List<Grade> findByClassId(Integer classId);
    List<Grade> findByCourseNameContaining(String courseName);
    List<Grade> findBySemester(String semester);
    List<Grade> findByAcademicYear(String academicYear);
    List<Grade> findByExamDateBetween(LocalDate startDate, LocalDate endDate);
}


