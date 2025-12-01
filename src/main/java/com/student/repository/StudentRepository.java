package com.student.repository;

import com.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    Optional<Student> findByStudentNo(String studentNo);
    List<Student> findByNameContaining(String name);
    List<Student> findByStudentNoContaining(String studentNo);
    List<Student> findByClassId(Integer classId);
    List<Student> findByStatus(Student.StudentStatus status);
    List<Student> findByEnrollmentDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT s FROM Student s JOIN Class c ON s.classId = c.id WHERE c.grade = :grade")
    List<Student> findByGrade(@Param("grade") String grade);
    
    @Query("SELECT s FROM Student s JOIN Class c ON s.classId = c.id WHERE c.department = :department")
    List<Student> findByDepartment(@Param("department") String department);
}


