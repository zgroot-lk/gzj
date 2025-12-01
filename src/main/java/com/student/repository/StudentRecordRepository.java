package com.student.repository;

import com.student.entity.StudentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRecordRepository extends JpaRepository<StudentRecord, Integer> {
    List<StudentRecord> findByStudentId(Integer studentId);
    Optional<StudentRecord> findFirstByStudentId(Integer studentId);
    List<StudentRecord> findByRecordStatus(StudentRecord.RecordStatus status);
}


